import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
  contact?: any;
};

const schema = z.object({
  name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url("Invalid URL").max(300).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

const empty = {
  name: "", last_name: "", title: "", company: "", email: "", phone: "", city: "",
  linkedin_url: "", notes: "", birthday: "", anniversary: "",
  priority: "medium", cooling_days: 30,
  last_contacted_at: "", next_follow_up_date: "",
};

export const ContactDialog = ({ open, onOpenChange, onSaved, contact }: Props) => {
  const { user } = useAuth();
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (contact) {
      setForm({
        ...empty,
        ...contact,
        last_name: contact.last_name ?? "",
        linkedin_url: contact.linkedin_url ?? "",
        priority: contact.priority ?? "medium",
        birthday: contact.birthday ?? "",
        anniversary: contact.anniversary ?? "",
        next_follow_up_date: contact.next_follow_up_date ?? "",
        last_contacted_at: contact.last_contacted_at ? contact.last_contacted_at.slice(0, 10) : "",
      });
    } else {
      setForm(empty);
    }
  }, [contact, open]);

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
    const payload: any = {
      name: form.name.trim(),
      last_name: form.last_name?.trim() || null,
      title: form.title?.trim() || null,
      company: form.company?.trim() || null,
      email: form.email?.trim() || null,
      phone: form.phone?.trim() || null,
      city: form.city?.trim() || null,
      linkedin_url: form.linkedin_url?.trim() || null,
      notes: form.notes?.trim() || null,
      birthday: form.birthday || null,
      anniversary: form.anniversary || null,
      priority: form.priority || "medium",
      cooling_days: Number(form.cooling_days) || 30,
      next_follow_up_date: form.next_follow_up_date || null,
      last_contacted_at: form.last_contacted_at ? new Date(form.last_contacted_at).toISOString() : null,
      user_id: user.id,
    };
    const { error } = contact
      ? await supabase.from("contacts").update(payload).eq("id", contact.id)
      : await supabase.from("contacts").insert(payload);
    setSaving(false);
    if (error) {
      setErrorMsg(error.message);
      toast.error(error.message);
      return;
    }
    toast.success(contact ? "Contact updated" : "Contact added");
    onSaved();
    onOpenChange(false);
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle></DialogHeader>
        {errorMsg && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">
            {errorMsg}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 py-2">
          <Field label="First name *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Last name"><Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></Field>
          <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Company"><Input value={form.company} onChange={(e) => set("company", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="LinkedIn URL"><Input placeholder="https://linkedin.com/in/…" value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} /></Field>
          <Field label="Priority">
            <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cooling days"><Input type="number" min={1} value={form.cooling_days} onChange={(e) => set("cooling_days", e.target.value)} /></Field>
          <Field label="Birthday"><Input type="date" value={form.birthday} onChange={(e) => set("birthday", e.target.value)} /></Field>
          <Field label="Anniversary"><Input type="date" value={form.anniversary} onChange={(e) => set("anniversary", e.target.value)} /></Field>
          <Field label="Last contacted"><Input type="date" value={form.last_contacted_at} onChange={(e) => set("last_contacted_at", e.target.value)} /></Field>
          <Field label="Next follow-up"><Input type="date" value={form.next_follow_up_date} onChange={(e) => set("next_follow_up_date", e.target.value)} /></Field>
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
