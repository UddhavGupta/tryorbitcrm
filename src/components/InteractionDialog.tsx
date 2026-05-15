import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { todayLocalISO, dateOnlyToISO } from "@/lib/dates";

export const INTERACTION_TYPES = ["meeting", "email", "call", "text", "intro", "note"] as const;
export type InteractionType = typeof INTERACTION_TYPES[number];

const labels: Record<InteractionType, string> = {
  meeting: "Meeting", email: "Email", call: "Call", text: "Text", intro: "Intro", note: "Note",
};

const schema = z.object({
  kind: z.enum(INTERACTION_TYPES),
  occurred_at: z.string().min(1, "Date is required"),
  note: z.string().trim().min(1, "Summary is required").max(5000),
  next_steps: z.string().trim().max(2000).optional().or(z.literal("")),
});

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
  contactId: string;
  interaction?: any;
  defaultNote?: string;
};

export const InteractionDialog = ({ open, onOpenChange, onSaved, contactId, interaction, defaultNote }: Props) => {
  const { user } = useAuth();
  const [form, setForm] = useState<any>({
    kind: "note",
    occurred_at: todayLocalISO(),
    note: "",
    next_steps: "",
    update_last_contacted: true,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (interaction) {
      setForm({
        kind: interaction.kind ?? "note",
        occurred_at: interaction.occurred_at ? interaction.occurred_at.slice(0, 10) : todayLocalISO(),
        note: interaction.note ?? "",
        next_steps: interaction.next_steps ?? "",
        update_last_contacted: false,
      });
    } else {
      setForm({
        kind: "note",
        occurred_at: todayLocalISO(),
        note: defaultNote ?? "",
        next_steps: "",
        update_last_contacted: true,
      });
    }
  }, [interaction, open, defaultNote]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    const occurredISO = dateOnlyToISO(form.occurred_at) ?? new Date().toISOString();
    const payload = {
      kind: form.kind,
      occurred_at: occurredISO,
      note: form.note.trim(),
      next_steps: form.next_steps?.trim() || null,
      contact_id: contactId,
      user_id: user.id,
    };
    const { error } = interaction
      ? await supabase.from("interactions").update(payload).eq("id", interaction.id)
      : await supabase.from("interactions").insert(payload);

    if (!error && form.update_last_contacted) {
      await supabase.from("contacts").update({ last_contacted_at: occurredISO }).eq("id", contactId);
    }

    setSaving(false);
    if (error) {
      setErrorMsg(error.message);
      toast.error(error.message);
      return;
    }
    toast.success(interaction ? "Interaction updated" : "Interaction logged");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{interaction ? "Edit interaction" : "Log interaction"}</DialogTitle></DialogHeader>
        {errorMsg && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">{errorMsg}</div>
        )}
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.kind} onValueChange={(v) => set("kind", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INTERACTION_TYPES.map((t) => <SelectItem key={t} value={t}>{labels[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date *</Label>
            <Input type="date" value={form.occurred_at} onChange={(e) => set("occurred_at", e.target.value)} />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Summary *</Label>
            <Textarea rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="What did you talk about?" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Next steps</Label>
            <Textarea rows={2} value={form.next_steps} onChange={(e) => set("next_steps", e.target.value)} placeholder="Optional follow-up actions" />
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox checked={form.update_last_contacted} onCheckedChange={(v) => set("update_last_contacted", !!v)} />
            Update contact's last contacted date
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gradient-primary">{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const interactionTypeLabel = (k: string) => labels[k as InteractionType] ?? k;
