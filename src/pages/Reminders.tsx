import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, parseISO, isPast, isToday } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Reminders = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [contactId, setContactId] = useState<string>("none");

  const { data: reminders } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data } = await supabase.from("reminders").select("*, contacts(id, name)").order("due_date");
      return data ?? [];
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["all-contacts-mini"],
    queryFn: async () => (await supabase.from("contacts").select("id, name").order("name")).data ?? [],
  });

  const create = async () => {
    if (!title.trim() || !user) return;
    await supabase.from("reminders").insert({
      user_id: user.id, title, due_date: date,
      contact_id: contactId === "none" ? null : contactId,
    });
    setTitle("");
    qc.invalidateQueries({ queryKey: ["reminders"] });
    toast.success("Reminder added");
  };

  const toggle = async (r: any) => {
    await supabase.from("reminders").update({ completed: !r.completed }).eq("id", r.id);
    qc.invalidateQueries({ queryKey: ["reminders"] });
  };

  const remove = async (id: string) => {
    await supabase.from("reminders").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["reminders"] });
  };

  const open = (reminders ?? []).filter((r: any) => !r.completed);
  const done = (reminders ?? []).filter((r: any) => r.completed);

  return (
    <AppLayout>
      <h1 className="text-3xl font-semibold tracking-tight">Reminders</h1>
      <p className="text-muted-foreground mt-1 mb-6">Stay on top of follow-ups.</p>

      <div className="surface-card p-4 grid sm:grid-cols-[1fr_auto_auto_auto] gap-2 mb-6">
        <Input placeholder="What's the follow-up?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Select value={contactId} onValueChange={setContactId}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="No contact" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No contact</SelectItem>
            {(contacts ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-44" />
        <Button onClick={create} className="gradient-primary"><Plus className="h-4 w-4 mr-1" />Add</Button>
      </div>

      <h2 className="font-semibold mb-2">Open ({open.length})</h2>
      <div className="surface-card divide-y divide-border mb-8">
        {open.map((r: any) => {
          const overdue = !r.completed && isPast(parseISO(r.due_date)) && !isToday(parseISO(r.due_date));
          return (
            <div key={r.id} className="flex items-center gap-3 p-4">
              <input type="checkbox" checked={r.completed} onChange={() => toggle(r)} />
              <div className="flex-1">
                <p className="font-medium">{r.title}</p>
                {r.contacts && <Link to={`/app/people/${r.contacts.id}`} className="text-sm text-muted-foreground hover:text-primary">{r.contacts.name}</Link>}
              </div>
              <span className={`text-sm ${overdue ? "text-destructive" : "text-muted-foreground"}`}>{format(parseISO(r.due_date), "MMM d")}</span>
              <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          );
        })}
        {open.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">All clear.</div>}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="font-semibold mb-2">Completed</h2>
          <div className="surface-card divide-y divide-border">
            {done.map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 p-4">
                <input type="checkbox" checked onChange={() => toggle(r)} />
                <div className="flex-1 line-through text-muted-foreground">{r.title}</div>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Reminders;
