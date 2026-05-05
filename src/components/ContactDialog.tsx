import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
  contact?: any;
};

export const ContactDialog = ({ open, onOpenChange, onSaved, contact }: Props) => {
  const { user } = useAuth();
  const [form, setForm] = useState<any>({ name: "", title: "", company: "", email: "", phone: "", city: "", notes: "", birthday: "", anniversary: "", cooling_days: 30 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) setForm({ ...contact, birthday: contact.birthday ?? "", anniversary: contact.anniversary ?? "" });
    else setForm({ name: "", title: "", company: "", email: "", phone: "", city: "", notes: "", birthday: "", anniversary: "", cooling_days: 30 });
  }, [contact, open]);

  const save = async () => {
    if (!user || !form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    const payload = {
      name: form.name, title: form.title || null, company: form.company || null,
      email: form.email || null, phone: form.phone || null, city: form.city || null,
      notes: form.notes || null, birthday: form.birthday || null, anniversary: form.anniversary || null,
      cooling_days: Number(form.cooling_days) || 30, user_id: user.id,
    };
    const { error } = contact
      ? await supabase.from("contacts").update(payload).eq("id", contact.id)
      : await supabase.from("contacts").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(contact ? "Contact updated" : "Contact added");
    onSaved();
    onOpenChange(false);
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <Field label="Name" className="col-span-2"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Company"><Input value={form.company} onChange={(e) => set("company", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="Cooling days"><Input type="number" value={form.cooling_days} onChange={(e) => set("cooling_days", e.target.value)} /></Field>
          <Field label="Birthday"><Input type="date" value={form.birthday} onChange={(e) => set("birthday", e.target.value)} /></Field>
          <Field label="Anniversary"><Input type="date" value={form.anniversary} onChange={(e) => set("anniversary", e.target.value)} /></Field>
          <Field label="Notes" className="col-span-2"><Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="gradient-primary">{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children, className = "" }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label>{label}</Label>
    {children}
  </div>
);
