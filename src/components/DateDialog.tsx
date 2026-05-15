import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { todayLocalISO } from "@/lib/dates";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  event_date: z.string().min(1, "Date is required"),
  event_type: z.enum(["birthday", "anniversary", "milestone", "other"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
  record?: any;
};

export const DateDialog = ({ open, onOpenChange, onSaved, record }: Props) => {
  const { user } = useAuth();
  const [form, setForm] = useState<any>({
    title: "",
    event_date: todayLocalISO(),
    event_type: "other",
    contact_id: "none",
    recurring: true,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: contacts } = useQuery({
    queryKey: ["all-contacts-mini"],
    queryFn: async () => (await supabase.from("contacts").select("id, name, last_name").order("name")).data ?? [],
    enabled: open,
  });

  useEffect(() => {
    setErrorMsg(null);
    if (record) {
      setForm({
        title: record.title ?? "",
        event_date: record.event_date ?? todayLocalISO(),
        event_type: record.event_type ?? "other",
        contact_id: record.contact_id ?? "none",
        recurring: record.recurring ?? true,
        notes: record.notes ?? "",
      });
    } else {
      setForm({ title: "", event_date: todayLocalISO(), event_type: "other", contact_id: "none", recurring: true, notes: "" });
    }
  }, [record, open]);

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
      event_date: form.event_date,
      event_type: form.event_type,
      recurring: form.recurring,
      notes: form.notes?.trim() || null,
      contact_id: form.contact_id && form.contact_id !== "none" ? form.contact_id : null,
      user_id: user.id,
    };
    const { error } = record
      ? await supabase.from("custom_dates").update(payload).eq("id", record.id)
      : await supabase.from("custom_dates").insert(payload);
    setSaving(false);
    if (error) { setErrorMsg(error.message); toast.error(error.message); return; }
    toast.success(record ? "Date updated" : "Date added");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{record ? "Edit date" : "New date"}</DialogTitle></DialogHeader>
        {errorMsg && <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">{errorMsg}</div>}
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Birthday, anniversary, work-iversary…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.event_date} onChange={(e) => set("event_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.event_type} onValueChange={(v) => set("event_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Contact (optional)</Label>
            <Select value={form.contact_id} onValueChange={(v) => set("contact_id", v)}>
              <SelectTrigger><SelectValue placeholder="No contact" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No contact (standalone)</SelectItem>
                {(contacts ?? []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{[c.name, c.last_name].filter(Boolean).join(" ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <Label className="cursor-pointer">Repeats yearly</Label>
              <p className="text-xs text-muted-foreground">Show this date every year on the same day.</p>
            </div>
            <Switch checked={form.recurring} onCheckedChange={(v) => set("recurring", v)} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional details." />
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
