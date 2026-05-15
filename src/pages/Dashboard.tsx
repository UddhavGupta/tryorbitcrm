import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, differenceInDays, parseISO, addDays, isWithinInterval, setYear } from "date-fns";
import { Bell, Cake, Snowflake, Sparkles, Plus, Users, AlertTriangle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/PageHeader";
import { InlineEmpty } from "@/components/EmptyState";
import { seedDemo } from "@/lib/demo";
import { toast } from "sonner";
import { todayLocalISO } from "@/lib/dates";
import { isDemoUser } from "@/components/DemoBadge";
import {
  getRelationshipStatus, getSuggestedAction, STATUS_LABEL, STATUS_CLASSES,
  ACTION_LABEL, ACTION_CLASSES, INTEL_DISCLAIMER,
} from "@/lib/relationshipIntel";

function nextOccurrence(dateStr: string) {
  const d = parseISO(dateStr);
  const today = new Date();
  let next = setYear(d, today.getFullYear());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next = setYear(d, today.getFullYear() + 1);
  }
  return next;
}

const priorityRank = (p?: string) => (p === "high" ? 0 : p === "medium" ? 1 : 2);

const Dashboard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const todayStr = todayLocalISO();

  const { data: reminders } = useQuery({
    queryKey: ["reminders-today"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reminders")
        .select("*, contacts(id, name, last_name, priority)")
        .eq("completed", false)
        .lte("due_date", todayStr)
        .order("due_date");
      return data ?? [];
    },
  });

  const { data: openReminders } = useQuery({
    queryKey: ["reminders-open-count"],
    queryFn: async () => {
      const { data, count } = await supabase
        .from("reminders")
        .select("contact_id, due_date", { count: "exact" })
        .eq("completed", false)
        .order("due_date");
      const earliest = new Map<string, string>();
      (data ?? []).forEach((r: any) => {
        if (r.contact_id && !earliest.has(r.contact_id)) earliest.set(r.contact_id, r.due_date);
      });
      return { count: count ?? 0, earliest };
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["dashboard-contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*").order("name");
      return data ?? [];
    },
  });

  // Reach-outs: reminders + contacts with next_follow_up_date today/overdue.
  // Dedupe: if a contact has both a reminder and a follow-up date, prefer the reminder row.
  const reachOuts = useMemo(() => {
    const seenContacts = new Set<string>();
    const fromReminders = (reminders ?? []).map((r: any) => {
      const contactName = r.contacts ? [r.contacts.name, r.contacts.last_name].filter(Boolean).join(" ") : "";
      let title = (r.title ?? "").trim();
      if (contactName && new RegExp(`\\s+with\\s+${r.contacts.name}.*$`, "i").test(title)) {
        title = title.replace(/\s+with\s+.+$/i, "");
      }
      if (!title) title = "Follow up";
      if (r.contacts?.id) seenContacts.add(r.contacts.id);
      return {
        kind: "reminder" as const,
        id: r.id,
        title,
        contact: r.contacts ? { id: r.contacts.id, name: contactName } : null,
        date: r.due_date,
        overdue: r.due_date < todayStr,
        priority: r.priority ?? r.contacts?.priority ?? "medium",
      };
    });
    const fromContacts = (contacts ?? [])
      .filter((c: any) => c.next_follow_up_date && c.next_follow_up_date <= todayStr && !seenContacts.has(c.id))
      .map((c: any) => ({
        kind: "contact" as const,
        id: c.id,
        title: "Follow up",
        contact: { id: c.id, name: [c.name, c.last_name].filter(Boolean).join(" ") },
        date: c.next_follow_up_date,
        overdue: c.next_follow_up_date < todayStr,
        priority: c.priority ?? "medium",
      }));
    return [...fromReminders, ...fromContacts].sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      const p = priorityRank(a.priority) - priorityRank(b.priority);
      if (p !== 0) return p;
      return a.date.localeCompare(b.date);
    });
  }, [reminders, contacts, todayStr]);

  const upcomingDates = useMemo(() => (contacts ?? [])
    .flatMap((c: any) => {
      const arr: any[] = [];
      if (c.birthday) arr.push({ contact: c, type: "Birthday", date: nextOccurrence(c.birthday) });
      if (c.anniversary) arr.push({ contact: c, type: "Anniversary", date: nextOccurrence(c.anniversary) });
      return arr;
    })
    .filter((e) => isWithinInterval(e.date, { start: new Date(), end: addDays(new Date(), 30) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()), [contacts]);

  const cooling = useMemo(() => (contacts ?? [])
    .filter((c: any) => c.last_contacted_at)
    .map((c: any) => ({ c, days: differenceInDays(new Date(), parseISO(c.last_contacted_at)) }))
    .filter((x) => x.days > 60)
    .sort((a, b) => {
      const p = priorityRank(a.c.priority) - priorityRank(b.c.priority);
      if (p !== 0) return p;
      return b.days - a.days;
    })
    .slice(0, 8), [contacts]);

  // Stats
  const totalContacts = contacts?.length ?? 0;
  const overdueRemindersCount = (reminders ?? []).filter((r: any) => r.due_date < todayStr).length;
  const highPriorityCount = (contacts ?? []).filter((c: any) => c.priority === "high").length;

  const completeReminder = async (id: string) => {
    await supabase.from("reminders").update({ completed: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["reminders-today"] });
    qc.invalidateQueries({ queryKey: ["reminders-open-count"] });
    qc.invalidateQueries({ queryKey: ["reminders"] });
    toast.success("Reminder completed");
  };

  const runDemo = async () => {
    if (!user) return;
    toast.loading("Loading demo data…", { id: "seed" });
    await seedDemo(user.id);
    qc.invalidateQueries();
    toast.success("Demo data loaded", { id: "seed" });
  };

  const unloadDemo = async () => {
    if (!user) return;
    toast.loading("Unloading demo data…", { id: "seed" });
    await supabase.from("reminders").delete().eq("user_id", user.id);
    await supabase.from("interactions").delete().eq("user_id", user.id);
    await supabase.from("contact_groups").delete().eq("user_id", user.id);
    await supabase.from("contacts").delete().eq("user_id", user.id);
    await supabase.from("groups").delete().eq("user_id", user.id);
    qc.invalidateQueries();
    toast.success("Demo data removed", { id: "seed" });
  };

  const isEmpty = totalContacts === 0;

  return (
    <AppLayout>
      <PageHeader
        eyebrow={format(new Date(), "EEEE, MMMM d")}
        title="Today"
        description="Your daily snapshot — who's due, who's drifting, what's coming up."
        actions={
          <>
            {isEmpty && (
              <Button variant="outline" onClick={runDemo} className="flex-1 sm:flex-none"><Sparkles className="h-4 w-4 mr-2" />Load demo data</Button>
            )}
            {!isEmpty && isDemoUser(user) && (
              <Button variant="outline" onClick={unloadDemo} className="flex-1 sm:flex-none"><Sparkles className="h-4 w-4 mr-2" />Unload demo data</Button>
            )}
            <Button asChild className="gradient-primary flex-1 sm:flex-none"><Link to="/app/people"><Plus className="h-4 w-4 mr-2" />Add contact</Link></Button>
          </>
        }
      />

      {isEmpty && (
        <div className="surface-card p-10 text-center mb-8 animate-fade-up">
          <h3 className="text-lg font-semibold">Your orbit is empty</h3>
          <p className="text-muted-foreground mt-1">Load demo data to explore, or add your first contact.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 animate-fade-up">
        <StatCard label="Total contacts" value={totalContacts} icon={Users} to="/app/people" />
        <StatCard label="Open reminders" value={openReminders?.count ?? 0} icon={Bell} to="/app/reminders" />
        <StatCard label="Overdue reminders" value={overdueRemindersCount} icon={AlertTriangle} to="/app/reminders" tone="destructive" />
        <StatCard label="High-priority contacts" value={highPriorityCount} icon={Star} to="/app/people?priority=high" tone="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="animate-fade-up-delay-1">
          <Section title="Today's reach-outs" icon={Bell} count={reachOuts.length}>
            {reachOuts.length === 0 ? (
              <InlineEmpty text="Nothing due today. Take a breath." action={
                <Button variant="outline" size="sm" asChild><Link to="/app/reminders">View all reminders</Link></Button>
              } />
            ) : (
              <ul className="divide-y divide-border -mx-1">
                {reachOuts.slice(0, 8).map((r) => (
                  <li key={`${r.kind}-${r.id}`} className="px-1 py-3 flex items-start gap-3">
                    {r.kind === "reminder" ? (
                      <Checkbox onCheckedChange={() => completeReminder(r.id)} className="mt-1" />
                    ) : (
                      <span className="mt-1 h-4 w-4 rounded-full border border-border inline-block" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.title}</p>
                      {r.contact && (
                        <Link to={`/app/people/${r.contact.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {r.contact.name}
                        </Link>
                      )}
                    </div>
                    <span className={`pill num-tabular ${r.overdue ? "pill-destructive" : "pill-primary"}`}>
                      {r.overdue ? "Overdue · " : "Today · "}{format(parseISO(r.date), "MMM d")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="animate-fade-up-delay-1">
          <Section title="Birthdays & anniversaries" icon={Cake} count={upcomingDates.length}>
            {upcomingDates.length === 0 ? (
              <InlineEmpty text="No upcoming dates in the next 30 days." action={
                <Button variant="outline" size="sm" asChild><Link to="/app/dates">Open dates</Link></Button>
              } />
            ) : (
              <ul className="divide-y divide-border -mx-1">
                {upcomingDates.slice(0, 6).map((e, i) => {
                  const days = differenceInDays(e.date, new Date());
                  return (
                    <li key={i} className="px-1 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <Link to={`/app/people/${e.contact.id}`} className="font-medium hover:text-primary transition-colors truncate block">{e.contact.name}</Link>
                        <p className="text-sm text-muted-foreground">{e.type} · <span className="num-tabular">{format(e.date, "MMM d")}</span></p>
                      </div>
                      <span className="pill pill-muted num-tabular">{days <= 0 ? "today" : `in ${days}d`}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </div>

        <div className="animate-fade-up-delay-2">
          <Section title="Cooling alerts" icon={Snowflake} count={cooling.length}>
            {cooling.length === 0 ? (
              <InlineEmpty text="All your relationships are warm." />
            ) : (
              <>
                <ul className="divide-y divide-border -mx-1">
                  {cooling.map(({ c, days }) => {
                    const status = getRelationshipStatus(c.last_contacted_at);
                    const action = getSuggestedAction({
                      priority: c.priority,
                      last_contacted_at: c.last_contacted_at,
                      birthday: c.birthday,
                      nextOpenReminderDue: openReminders?.earliest.get(c.id) ?? null,
                    });
                    return (
                      <li key={c.id} className="px-1 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <Link to={`/app/people/${c.id}`} className="font-medium hover:text-primary transition-colors truncate block">
                            {[c.name, c.last_name].filter(Boolean).join(" ")}
                          </Link>
                          <p className="text-sm text-muted-foreground truncate">{c.title || c.company || "—"}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className={`text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded-full border ${STATUS_CLASSES[status]}`}>{STATUS_LABEL[status]}</span>
                            {action !== "no_action" && (
                              <span className={`text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded-full border ${ACTION_CLASSES[action]}`}>{ACTION_LABEL[action]}</span>
                            )}
                          </div>
                        </div>
                        <span className="pill pill-muted num-tabular">{days}d</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground italic leading-relaxed">{INTEL_DISCLAIMER}</p>
              </>
            )}
          </Section>
        </div>
      </div>
    </AppLayout>
  );
};

const StatCard = ({ label, value, icon: Icon, to, tone }: any) => {
  const iconWrap =
    tone === "destructive"
      ? "bg-[hsl(var(--destructive-soft))] text-destructive"
      : tone === "primary"
      ? "bg-[hsl(var(--primary-soft))] text-primary"
      : "bg-secondary text-muted-foreground";
  return (
    <Link to={to} className="surface-card p-4 lift hover:border-primary/40 block">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span className={`h-7 w-7 rounded-lg grid place-items-center ${iconWrap}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className={`text-3xl font-semibold mt-3 num-tabular ${tone === "destructive" ? "text-destructive" : ""}`}>{value}</p>
    </Link>
  );
};

const Section = ({ title, icon: Icon, count, children }: any) => (
  <div className="surface-card p-5 md:p-6 h-full">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg grid place-items-center bg-[hsl(var(--primary-soft))] text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5 num-tabular">{count}</span>
    </div>
    {children}
  </div>
);

export default Dashboard;
