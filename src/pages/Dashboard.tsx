import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, differenceInDays, parseISO, addDays, isWithinInterval, setYear } from "date-fns";
import { Bell, Cake, Snowflake, Sparkles, Plus, Users, AlertTriangle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { seedDemo } from "@/lib/demo";
import { toast } from "sonner";
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
  const todayStr = new Date().toISOString().slice(0, 10);

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

  // Reach-outs: reminders + contacts with next_follow_up_date today/overdue
  const reachOuts = (() => {
    const fromReminders = (reminders ?? []).map((r: any) => ({
      kind: "reminder" as const,
      id: r.id,
      title: r.title,
      contact: r.contacts ? { id: r.contacts.id, name: [r.contacts.name, r.contacts.last_name].filter(Boolean).join(" ") } : null,
      date: r.due_date,
      overdue: r.due_date < todayStr,
      priority: r.priority ?? r.contacts?.priority ?? "medium",
    }));
    const fromContacts = (contacts ?? [])
      .filter((c: any) => c.next_follow_up_date && c.next_follow_up_date <= todayStr)
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
  })();

  const upcomingDates = (contacts ?? [])
    .flatMap((c: any) => {
      const arr: any[] = [];
      if (c.birthday) arr.push({ contact: c, type: "Birthday", date: nextOccurrence(c.birthday) });
      if (c.anniversary) arr.push({ contact: c, type: "Anniversary", date: nextOccurrence(c.anniversary) });
      return arr;
    })
    .filter((e) => isWithinInterval(e.date, { start: new Date(), end: addDays(new Date(), 30) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const cooling = (contacts ?? [])
    .filter((c: any) => c.last_contacted_at)
    .map((c: any) => ({ c, days: differenceInDays(new Date(), parseISO(c.last_contacted_at)) }))
    .filter((x) => x.days > 60)
    .sort((a, b) => {
      const p = priorityRank(a.c.priority) - priorityRank(b.c.priority);
      if (p !== 0) return p;
      return b.days - a.days;
    })
    .slice(0, 8);

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
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Today</h1>
          <p className="text-muted-foreground mt-1">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
        <div className="flex gap-2">
          {isEmpty ? (
            <Button variant="outline" onClick={runDemo}><Sparkles className="h-4 w-4 mr-2" />Load demo data</Button>
          ) : (
            <Button variant="outline" onClick={unloadDemo}><Sparkles className="h-4 w-4 mr-2" />Unload demo data</Button>
          )}
          <Button asChild className="gradient-primary"><Link to="/app/people"><Plus className="h-4 w-4 mr-2" />Add contact</Link></Button>
        </div>
      </div>

      {isEmpty && (
        <div className="surface-card p-10 text-center mb-8">
          <h3 className="text-lg font-semibold">Your orbit is empty</h3>
          <p className="text-muted-foreground mt-1">Load demo data to explore, or add your first contact.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total contacts" value={totalContacts} icon={Users} to="/app/people" />
        <StatCard label="Open reminders" value={openReminders?.count ?? 0} icon={Bell} to="/app/reminders" />
        <StatCard label="Overdue reminders" value={overdueRemindersCount} icon={AlertTriangle} to="/app/reminders" tone="destructive" />
        <StatCard label="High-priority contacts" value={highPriorityCount} icon={Star} to="/app/people?priority=high" tone="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Section title="Today's reach-outs" icon={Bell} count={reachOuts.length}>
          {reachOuts.length === 0 ? (
            <Empty text="Nothing due today. Take a breath." />
          ) : (
            <ul className="divide-y divide-border">
              {reachOuts.slice(0, 8).map((r) => (
                <li key={`${r.kind}-${r.id}`} className="py-3 flex items-start gap-3">
                  {r.kind === "reminder" ? (
                    <Checkbox onCheckedChange={() => completeReminder(r.id)} className="mt-1" />
                  ) : (
                    <span className="mt-1 h-4 w-4 rounded-full border border-border inline-block" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{r.title}</p>
                    {r.contact && (
                      <Link to={`/app/people/${r.contact.id}`} className="text-sm text-muted-foreground hover:text-primary">
                        {r.contact.name}
                      </Link>
                    )}
                  </div>
                  <span className={`text-xs whitespace-nowrap font-medium ${r.overdue ? "text-destructive" : "text-primary"}`}>
                    {r.overdue ? "Overdue · " : "Today · "}{format(parseISO(r.date), "MMM d")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Birthdays & anniversaries" icon={Cake} count={upcomingDates.length}>
          {upcomingDates.length === 0 ? (
            <Empty text="No upcoming dates in the next 30 days." />
          ) : (
            <ul className="divide-y divide-border">
              {upcomingDates.slice(0, 6).map((e, i) => {
                const days = differenceInDays(e.date, new Date());
                return (
                  <li key={i} className="py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <Link to={`/app/people/${e.contact.id}`} className="font-medium hover:text-primary">{e.contact.name}</Link>
                      <p className="text-sm text-muted-foreground">{e.type} · {format(e.date, "MMM d")}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{days <= 0 ? "today" : `in ${days}d`}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title="Cooling alerts" icon={Snowflake} count={cooling.length}>
          {cooling.length === 0 ? (
            <Empty text="All your relationships are warm." />
          ) : (
            <ul className="divide-y divide-border">
              {cooling.map(({ c, days }) => (
                <li key={c.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link to={`/app/people/${c.id}`} className="font-medium hover:text-primary truncate block">
                      {[c.name, c.last_name].filter(Boolean).join(" ")}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">{c.title || c.company || "—"}</p>
                  </div>
                  {c.priority === "high" && <span className="text-[10px] uppercase tracking-wide text-destructive font-semibold">High</span>}
                  <span className="text-xs text-warning font-medium whitespace-nowrap">{days}d cold</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </AppLayout>
  );
};

const StatCard = ({ label, value, icon: Icon, to, tone }: any) => (
  <Link to={to} className="surface-card p-4 hover:border-primary/40 transition-colors">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Icon className={`h-4 w-4 ${tone === "destructive" ? "text-destructive" : tone === "primary" ? "text-primary" : "text-muted-foreground"}`} />
    </div>
    <p className={`text-2xl font-semibold mt-2 ${tone === "destructive" ? "text-destructive" : ""}`}>{value}</p>
  </Link>
);

const Section = ({ title, icon: Icon, count, children }: any) => (
  <div className="surface-card p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{count}</span>
    </div>
    {children}
  </div>
);

const Empty = ({ text }: { text: string }) => (
  <p className="text-sm text-muted-foreground py-6 text-center">{text}</p>
);

export default Dashboard;
