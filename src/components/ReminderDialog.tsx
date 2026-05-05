import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  due_date: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
  reminder?: any;
  defaultContactId?: string | null;
  lockContact?: boolean;
};

export const ReminderDialog = ({ open, onOpenChange, onSaved, reminder, defaultContactId, lockContact }: Props) => {
  const { user } = useAuth();
  const [form, setForm] = useState<any>({
    title: "", due_date: new Date().toISOString().slice(0, 10),
    priority: "medium", contact_id: defaultContactId ?? "none", completed: false, notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: contacts } = useQuery({
    queryKey: ["all-contacts-mini"],
    queryFn: async () => (await supabase.from("contacts").select("id, name, last_name").order("name")).data ?? [],
    enabled: open && !lockContact,
  });

  useEffect(() => {
    setErrorMsg(null);
    if (reminder) {
      setForm({
        title: reminder.title ?? "",
        due_date: reminder.due_date ?? new Date().toISOString().slice(0, 10),
        priority: reminder.priority ?? "medium",
        contact_id: reminder.contact_id ?? "none",
        completed: !!reminder.completed,
        notes: reminder.notes ?? "",
      });
    } else {
      setForm({
        title: "", due_date: new Date().toISOString().slice(0, 10),
        priority: "medium", contact_id: defaultContactId ?? "none", completed: false, notes: "",
      });
    }
  }, [reminder, open, defaultContactId]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      setErrorMsg(msg); toast.error(msg); return;
    }
    setSaving(true); setErrorMsg(null);
    const payload: any = {
      title: form.title.trim(),
      due_date: form.due_date,
      priority: form.priority,
      completed: form.completed,
      notes: form.notes?.trim() || null,
      contact_id: form.contact_id && form.contact_id !== "none" ? form.contact_id : null,
      user_id: user.id,
    };
    const { error } = reminder
      ? await supabase.from("reminders").update(payload).eq("id", reminder.id)
      : await supabase.from("reminders").insert(payload);
    setSaving(false);
    if (error) { setErrorMsg(error.message); toast.error(error.message); return; }
    toast.success(reminder ? "Reminder updated" : "Reminder added");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{reminder ? "Edit reminder" : "New reminder"}</DialogTitle></DialogHeader>
        {errorMsg && <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">{errorMsg}</div>}
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Follow up about…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due date *</Label>
              <Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!lockContact && (
            <div className="space-y-1.5">
              <Label>Contact</Label>
              <Select value={form.contact_id} onValueChange={(v) => set("contact_id", v)}>
                <SelectTrigger><SelectValue placeholder="No contact" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No contact</SelectItem>
                  {(contacts ?? []).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{[c.name, c.last_name].filter(Boolean).join(" ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {reminder && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.completed ? "completed" : "open"} onValueChange={(v) => set("completed", v === "completed")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional context for this follow-up." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gradient-primary">{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const priorityClasses = (p: string) =>
  p === "high" ? "bg-destructive/10 text-destructive"
  : p === "low" ? "bg-secondary text-muted-foreground"
  : "bg-primary/10 text-primary";
