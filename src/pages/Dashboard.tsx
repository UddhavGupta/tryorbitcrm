import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, differenceInDays, parseISO, isToday, isFuture, addDays, isWithinInterval, setYear } from "date-fns";
import { Bell, Cake, Snowflake, Sparkles, ArrowRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { seedDemo } from "@/lib/demo";
import { toast } from "sonner";

function nextOccurrence(dateStr: string) {
  const d = parseISO(dateStr);
  const today = new Date();
  let next = setYear(d, today.getFullYear());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next = setYear(d, today.getFullYear() + 1);
  }
  return next;
}

const Dashboard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: reminders } = useQuery({
    queryKey: ["reminders-today"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("reminders")
        .select("*, contacts(name)")
        .eq("completed", false)
        .lte("due_date", today)
        .order("due_date");
      return data ?? [];
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["dashboard-contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*").order("name");
      return data ?? [];
    },
  });

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
    .filter((x) => x.days >= x.c.cooling_days)
    .sort((a, b) => b.days - a.days)
    .slice(0, 6);

  const completeReminder = async (id: string) => {
    await supabase.from("reminders").update({ completed: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["reminders-today"] });
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

  const isEmpty = (contacts?.length ?? 0) === 0;

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

      <div className="grid lg:grid-cols-3 gap-6">
        <Section title="Today's reach-outs" icon={Bell} count={reminders?.length ?? 0}>
          {(reminders ?? []).length === 0 ? (
            <Empty text="Nothing due today. Take a breath." />
          ) : (
            <ul className="divide-y divide-border">
              {reminders!.map((r: any) => (
                <li key={r.id} className="py-3 flex items-start gap-3">
                  <Checkbox onCheckedChange={() => completeReminder(r.id)} className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">{r.title}</p>
                    {r.contacts?.name && <p className="text-sm text-muted-foreground">{r.contacts.name}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">{format(parseISO(r.due_date), "MMM d")}</span>
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
              {upcomingDates.slice(0, 6).map((e, i) => (
                <li key={i} className="py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <Link to={`/app/people/${e.contact.id}`} className="font-medium hover:text-primary">{e.contact.name}</Link>
                    <p className="text-sm text-muted-foreground">{e.type} · {format(e.date, "MMM d")}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">in {differenceInDays(e.date, new Date())}d</span>
                </li>
              ))}
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
                  <div className="flex-1">
                    <Link to={`/app/people/${c.id}`} className="font-medium hover:text-primary">{c.name}</Link>
                    <p className="text-sm text-muted-foreground">{c.title || c.company || "—"}</p>
                  </div>
                  <span className="text-xs text-warning font-medium">{days}d cold</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </AppLayout>
  );
};

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
