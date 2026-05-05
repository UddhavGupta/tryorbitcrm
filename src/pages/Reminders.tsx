import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, parseISO, isPast, isToday } from "date-fns";
import { Plus, Pencil, Trash2, Loader2, AlertCircle, CheckCircle2, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ReminderDialog, priorityClasses } from "@/components/ReminderDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Reminders = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"open" | "completed">("open");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: reminders, isLoading, error } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*, contacts(id, name, last_name)")
        .order("due_date");
      if (error) throw error;
      return data ?? [];
    },
  });

  const open = useMemo(() => (reminders ?? []).filter((r: any) => !r.completed), [reminders]);
  const done = useMemo(() => (reminders ?? []).filter((r: any) => r.completed).reverse(), [reminders]);
  const list = tab === "open" ? open : done;

  const toggle = async (r: any) => {
    const { error } = await supabase.from("reminders").update({ completed: !r.completed }).eq("id", r.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["reminders"] });
    qc.invalidateQueries({ queryKey: ["reminders-today"] });
    qc.invalidateQueries({ queryKey: ["contact-reminders"] });
    toast.success(!r.completed ? "Marked complete" : "Reopened");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["reminders"] });
    qc.invalidateQueries({ queryKey: ["reminders-today"] });
    qc.invalidateQueries({ queryKey: ["contact-reminders"] });
    toast.success("Reminder deleted");
  };

  return (
    <AppLayout>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground mt-1">Stay on top of follow-ups.</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />New reminder
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-4">
        <TabsList>
          <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({done.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="surface-card p-10 flex flex-col items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" /><p className="text-sm">Loading reminders…</p>
        </div>
      )}

      {error && (
        <div className="surface-card p-6 border border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div><p className="font-medium">Couldn't load reminders</p><p className="text-sm opacity-80">{(error as Error).message}</p></div>
        </div>
      )}

      {!isLoading && !error && list.length === 0 && (
        <div className="surface-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary mx-auto grid place-items-center mb-4">
            {tab === "open" ? <Bell className="h-6 w-6 text-primary-foreground" /> : <CheckCircle2 className="h-6 w-6 text-primary-foreground" />}
          </div>
          <h3 className="text-lg font-semibold">{tab === "open" ? "All clear" : "Nothing completed yet"}</h3>
          <p className="text-muted-foreground mt-1">{tab === "open" ? "No open follow-ups. Add one to keep momentum." : "Completed reminders will show up here."}</p>
          {tab === "open" && (
            <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gradient-primary mt-5">
              <Plus className="h-4 w-4 mr-2" />New reminder
            </Button>
          )}
        </div>
      )}

      {!isLoading && !error && list.length > 0 && (
        <div className="surface-card divide-y divide-border">
          {list.map((r: any) => {
            const due = parseISO(r.due_date);
            const overdue = !r.completed && isPast(due) && !isToday(due);
            const today = isToday(due);
            return (
              <div key={r.id} className="flex items-center gap-3 p-4">
                <Checkbox checked={r.completed} onCheckedChange={() => toggle(r)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium truncate ${r.completed ? "line-through text-muted-foreground" : ""}`}>{r.title}</p>
                    <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full ${priorityClasses(r.priority)}`}>{r.priority}</span>
                  </div>
                  {r.contacts && (
                    <Link to={`/app/people/${r.contacts.id}`} className="text-sm text-muted-foreground hover:text-primary">
                      {[r.contacts.name, r.contacts.last_name].filter(Boolean).join(" ")}
                    </Link>
                  )}
                </div>
                <span className={`text-sm whitespace-nowrap ${overdue ? "text-destructive font-medium" : today ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {overdue ? "Overdue · " : today ? "Today · " : ""}{format(due, "MMM d")}
                </span>
                <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this reminder?</AlertDialogTitle>
                      <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      )}

      <ReminderDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        reminder={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["reminders"] })}
      />
    </AppLayout>
  );
};

export default Reminders;
