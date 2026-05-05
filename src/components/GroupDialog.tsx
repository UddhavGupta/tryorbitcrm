import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

export const GROUP_COLORS = ["#a78bfa", "#34d399", "#fb923c", "#60a5fa", "#f472b6", "#facc15", "#f87171", "#22d3ee"];

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a color"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
  group?: any;
};

export const GroupDialog = ({ open, onOpenChange, onSaved, group }: Props) => {
  const { user } = useAuth();
  const [form, setForm] = useState<any>({ name: "", color: GROUP_COLORS[0], description: "" });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (group) setForm({ name: group.name ?? "", color: group.color ?? GROUP_COLORS[0], description: group.description ?? "" });
    else setForm({ name: "", color: GROUP_COLORS[0], description: "" });
  }, [group, open]);

  const save = async () => {
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input";
      setErrorMsg(msg); toast.error(msg); return;
    }
    setSaving(true); setErrorMsg(null);
    const payload = { name: form.name.trim(), color: form.color, description: form.description?.trim() || null, user_id: user.id };
    const { error } = group
      ? await supabase.from("groups").update(payload).eq("id", group.id)
      : await supabase.from("groups").insert(payload);
    setSaving(false);
    if (error) { setErrorMsg(error.message); toast.error(error.message); return; }
    toast.success(group ? "Group updated" : "Group created");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{group ? "Edit group" : "New group"}</DialogTitle></DialogHeader>
        {errorMsg && <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">{errorMsg}</div>}
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="e.g. Investors" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))} placeholder="What is this group for?" />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {GROUP_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((f: any) => ({ ...f, color: c }))}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
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
