import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isPast, isToday, differenceInDays, startOfWeek, endOfWeek, addDays } from "date-fns";
import { Plus, Pencil, Trash2, CheckCircle2, Bell, SlidersHorizontal, X, ArrowUpDown, Circle, Check, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ReminderDialog, priorityClasses } from "@/components/ReminderDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RowListSkeleton, ErrorState } from "@/components/LoadingStates";
import { PageHeader } from "@/components/PageHeader";
import { SampleDataButton } from "@/components/SampleDataButton";
import { toast } from "sonner";
import { todayLocalISO, dateToLocalISO } from "@/lib/dates";
import { parseQuickReminder } from "@/lib/parseQuickReminder";

type DueFilter = "all" | "today" | "overdue" | "week";
type SortBy = "due" | "priority" | "name";

const Reminders = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"open" | "completed">("open");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [quick, setQuick] = useState("");
  const [quickPreview, setQuickPreview] = useState<{ title: string; due_date: string } | null>(null);

  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [highOnly, setHighOnly] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("due");
  const [grouped, setGrouped] = useState(true);

  const { data: reminders, isLoading, error } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*, contacts(id, name, last_name, contact_groups(group_id, groups(id, name, color)))")
        .order("due_date");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: allGroups } = useQuery({
    queryKey: ["all-groups"],
    queryFn: async () => (await supabase.from("groups").select("*").order("name")).data ?? [],
  });

  const open = useMemo(() => (reminders ?? []).filter((r: any) => !r.completed), [reminders]);
  const done = useMemo(() => (reminders ?? []).filter((r: any) => r.completed), [reminders]);

  const filteredAndSorted = useMemo(() => {
    let list = tab === "open" ? open : done;
    const today = new Date();
    const todayStr = todayLocalISO();
    const wkStart = dateToLocalISO(startOfWeek(today, { weekStartsOn: 1 }));
    const wkEnd = dateToLocalISO(endOfWeek(today, { weekStartsOn: 1 }));

    if (dueFilter === "today") list = list.filter((r: any) => r.due_date === todayStr);
    else if (dueFilter === "overdue") list = list.filter((r: any) => r.due_date < todayStr);
    else if (dueFilter === "week") list = list.filter((r: any) => r.due_date >= wkStart && r.due_date <= wkEnd);

    if (highOnly) list = list.filter((r: any) => r.priority === "high");

    if (groupFilter !== "all") {
      list = list.filter((r: any) => r.contacts?.contact_groups?.some((cg: any) => cg.group_id === groupFilter));
    }

    const rank = (p: string) => (p === "high" ? 0 : p === "medium" ? 1 : 2);
    const sorted = [...list];
    sorted.sort((a: any, b: any) => {
      if (sortBy === "due") {
        if (tab === "completed") {
          const ad = a.completed_at ? new Date(a.completed_at).getTime() : 0;
          const bd = b.completed_at ? new Date(b.completed_at).getTime() : 0;
          return bd - ad;
        }
        return a.due_date.localeCompare(b.due_date);
      }
      if (sortBy === "priority") return rank(a.priority) - rank(b.priority);
      if (sortBy === "name") {
        const an = [a.contacts?.name, a.contacts?.last_name].filter(Boolean).join(" ") || a.title;
        const bn = [b.contacts?.name, b.contacts?.last_name].filter(Boolean).join(" ") || b.title;
        return an.localeCompare(bn);
      }
      return 0;
    });
    return sorted;
  }, [tab, open, done, dueFilter, highOnly, groupFilter, sortBy]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reminders"] });
    qc.invalidateQueries({ queryKey: ["reminders-today"] });
    qc.invalidateQueries({ queryKey: ["contact-reminders"] });
    qc.invalidateQueries({ queryKey: ["open-reminders-by-contact"] });
  };

  const setCompleted = async (r: any, completed: boolean) => {
    const { error } = await supabase.from("reminders").update({ completed }).eq("id", r.id);
    if (error) { toast.error(error.message); return false; }
    invalidate();
    return true;
  };

  const completeWithUndo = async (r: any) => {
    const ok = await setCompleted(r, true);
    if (!ok) return;
    toast.success("Marked complete", {
      action: {
        label: "Undo",
        onClick: () => setCompleted(r, false).then((ok) => ok && toast("Reopened")),
      },
      duration: 5000,
    });
  };

  const reopen = async (r: any) => {
    const ok = await setCompleted(r, false);
    if (ok) toast("Reopened");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    invalidate();
    toast.success("Reminder deleted");
  };

  const snooze = async (r: any, days: number) => {
    const base = parseISO(r.due_date);
    const today = new Date();
    const start = base > today ? base : today;
    const next = dateToLocalISO(addDays(start, days));
    const { error } = await supabase.from("reminders").update({ due_date: next }).eq("id", r.id);
    if (error) return toast.error(error.message);
    invalidate();
    toast.success(`Snoozed ${days === 1 ? "1 day" : days === 7 ? "1 week" : `${days} days`}`);
  };

  const submitQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quick.trim() || !user) return;
    const parsed = parseQuickReminder(quick);
    const { error } = await supabase.from("reminders").insert({
      user_id: user.id,
      title: parsed.title,
      due_date: parsed.due_date,
      priority: "medium",
    });
    if (error) return toast.error(error.message);
    setQuick("");
    setQuickPreview(null);
    invalidate();
    toast.success("Reminder added");
  };

  const onQuickChange = (v: string) => {
    setQuick(v);
    if (v.trim().length > 1) setQuickPreview(parseQuickReminder(v));
    else setQuickPreview(null);
  };

  const sections = useMemo(() => {
    if (tab !== "open" || !grouped) return null;
    const todayStr = todayLocalISO();
    const today = new Date();
    const wkEnd = dateToLocalISO(endOfWeek(today, { weekStartsOn: 1 }));
    const buckets = { overdue: [] as any[], today: [] as any[], week: [] as any[], later: [] as any[] };
    filteredAndSorted.forEach((r: any) => {
      if (r.due_date < todayStr) buckets.overdue.push(r);
      else if (r.due_date === todayStr) buckets.today.push(r);
      else if (r.due_date <= wkEnd) buckets.week.push(r);
      else buckets.later.push(r);
    });
    return buckets;
  }, [filteredAndSorted, tab, grouped]);

  const activeFilterCount = (dueFilter !== "all" ? 1 : 0) + (highOnly ? 1 : 0) + (groupFilter !== "all" ? 1 : 0);
  const clearAll = () => { setDueFilter("all"); setHighOnly(false); setGroupFilter("all"); };

  return (
    <AppLayout>
      <PageHeader
        title="Reminders"
        description="Stay on top of follow-ups across your orbit."
        actions={
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gradient-primary w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />New reminder
          </Button>
        }
      />

      {tab === "open" && (
        <form onSubmit={submitQuick} className="surface-card p-3 mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0 ml-1" />
          <Input
            value={quick}
            onChange={(e) => onQuickChange(e.target.value)}
            placeholder="Quick add — try 'Call Sarah tomorrow' or 'Email Pat in 3 days'"
            className="border-0 shadow-none focus-visible:ring-0 px-1"
          />
          {quickPreview && quick.trim() && (
            <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">
              → {format(parseISO(quickPreview.due_date), "EEE, MMM d")}
            </span>
          )}
          <Button type="submit" size="sm" disabled={!quick.trim()} className="gradient-primary shrink-0">Add</Button>
        </form>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({done.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="h-4 w-4 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="due">{tab === "completed" ? "Recently completed" : "Due date"}</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="name">Contact name</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 grid place-items-center">{activeFilterCount}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-3" align="start">
            <div className="space-y-1.5">
              <Label className="text-xs">Due</Label>
              <Select value={dueFilter} onValueChange={(v) => setDueFilter(v as DueFilter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  <SelectItem value="today">Due today</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={highOnly ? "high" : "all"} onValueChange={(v) => setHighOnly(v === "high")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any priority</SelectItem>
                  <SelectItem value="high">High only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Group</Label>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All groups</SelectItem>
                  {(allGroups ?? []).map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" className="w-full" onClick={clearAll}>
                <X className="h-4 w-4 mr-1" />Clear filters
              </Button>
            )}
          </PopoverContent>
        </Popover>
        {tab === "open" && (
          <Button variant="ghost" size="sm" onClick={() => setGrouped((g) => !g)} className="text-muted-foreground">
            {grouped ? "Flat list" : "Group by section"}
          </Button>
        )}
        {activeFilterCount > 0 && (
          <span className="text-sm text-muted-foreground">{filteredAndSorted.length} match</span>
        )}
      </div>

      {isLoading && <RowListSkeleton />}
      {error && <ErrorState title="Couldn't load reminders" message={(error as Error).message} />}

      {!isLoading && !error && filteredAndSorted.length === 0 && (
        <div className="surface-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary mx-auto grid place-items-center mb-4">
            {tab === "open" ? <Bell className="h-6 w-6 text-primary-foreground" /> : <CheckCircle2 className="h-6 w-6 text-primary-foreground" />}
          </div>
          <h3 className="text-lg font-semibold">
            {activeFilterCount > 0 ? "No reminders match these filters" : tab === "open" ? "All clear" : "Nothing completed yet"}
          </h3>
          <p className="text-muted-foreground mt-1">
            {activeFilterCount > 0 ? "Try adjusting or clearing filters." : tab === "open" ? "No open follow-ups. Add one to keep momentum." : "Completed reminders will show up here."}
          </p>
          {activeFilterCount > 0 ? (
            <Button onClick={clearAll} variant="outline" className="mt-5">Clear filters</Button>
          ) : tab === "open" && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />New reminder
              </Button>
              <SampleDataButton />
            </div>
          )}
        </div>
      )}

      {!isLoading && !error && filteredAndSorted.length > 0 && (
        sections ? (
          <div className="space-y-6">
            {(["overdue", "today", "week", "later"] as const).map((key) => {
              const items = sections[key];
              if (items.length === 0) return null;
              const label = key === "overdue" ? "Overdue" : key === "today" ? "Today" : key === "week" ? "This week" : "Later";
              return (
                <section key={key}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <h2 className={`text-sm font-semibold uppercase tracking-wide ${key === "overdue" ? "text-primary" : "text-muted-foreground"}`}>{label}</h2>
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="surface-card divide-y divide-border">
                    {items.map((r: any) => renderRow(r))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="surface-card divide-y divide-border">
            {filteredAndSorted.map((r: any) => renderRow(r))}
          </div>
        )
      )}

      <ReminderDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        reminder={editing}
        onSaved={invalidate}
      />
    </AppLayout>
  );
};

export default Reminders;
