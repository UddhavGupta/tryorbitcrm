import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { TagInput } from "@/components/TagInput";
import { dateOnlyToISO } from "@/lib/dates";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
  contact?: any;
  /** If true, navigate to the new contact's detail page after creating. Default true. */
  navigateOnCreate?: boolean;
};

const schema = z.object({
  name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url("Invalid LinkedIn URL").max(300).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  why_matters: z.string().trim().max(2000).optional().or(z.literal("")),
  reminder_title: z.string().trim().max(200).optional().or(z.literal("")),
});

const empty = {
  name: "", last_name: "", title: "", company: "", email: "", phone: "", city: "",
  linkedin_url: "", notes: "", why_matters: "",
  birthday: "", anniversary: "",
  priority: "medium", cooling_days: 30,
  last_contacted_at: "", next_follow_up_date: "",
  reminder_title: "",
  tags: [] as string[],
};

export const ContactDialog = ({ open, onOpenChange, onSaved, contact, navigateOnCreate = true }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  const { data: allGroups } = useQuery({
    queryKey: ["all-groups"],
    queryFn: async () => (await supabase.from("groups").select("*").order("name")).data ?? [],
    enabled: open,
  });

  useEffect(() => {
    setErrorMsg(null);
    if (contact) {
      setForm({
        ...empty,
        ...contact,
        last_name: contact.last_name ?? "",
        linkedin_url: contact.linkedin_url ?? "",
        why_matters: contact.why_matters ?? "",
        priority: contact.priority ?? "medium",
        birthday: contact.birthday ?? "",
        anniversary: contact.anniversary ?? "",
        next_follow_up_date: contact.next_follow_up_date ?? "",
        last_contacted_at: contact.last_contacted_at ? contact.last_contacted_at.slice(0, 10) : "",
        reminder_title: "",
        tags: Array.isArray(contact.tags) ? contact.tags : [],
      });
      setSelectedGroups(new Set((contact.contact_groups ?? []).map((cg: any) => cg.group_id)));
    } else {
      setForm(empty);
      setSelectedGroups(new Set());
    }
  }, [contact, open]);

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

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
      why_matters: form.why_matters?.trim() || null,
      birthday: form.birthday || null,
      anniversary: form.anniversary || null,
      priority: form.priority || "medium",
      cooling_days: Number(form.cooling_days) || 30,
      next_follow_up_date: form.next_follow_up_date || null,
      last_contacted_at: dateOnlyToISO(form.last_contacted_at),
      tags: Array.isArray(form.tags) ? form.tags.filter((t: string) => t && t.trim().length > 0) : [],
      user_id: user.id,
    };

    let savedId: string | null = contact?.id ?? null;
    if (contact) {
      const { error } = await supabase.from("contacts").update(payload).eq("id", contact.id);
      if (error) { setSaving(false); setErrorMsg(error.message); toast.error(error.message); return; }
    } else {
      const { data, error } = await supabase.from("contacts").insert(payload).select("id").single();
      if (error) { setSaving(false); setErrorMsg(error.message); toast.error(error.message); return; }
      savedId = data.id;
    }

    // Sync groups
    if (savedId) {
      const existing = new Set((contact?.contact_groups ?? []).map((cg: any) => cg.group_id));
      const toAdd = [...selectedGroups].filter((g) => !existing.has(g));
      const toRemove = [...existing].filter((g) => !selectedGroups.has(g as string)) as string[];
      if (toAdd.length) {
        await supabase.from("contact_groups").insert(toAdd.map((gid) => ({ contact_id: savedId!, group_id: gid, user_id: user.id })));
      }
      for (const gid of toRemove) {
        await supabase.from("contact_groups").delete().eq("contact_id", savedId).eq("group_id", gid);
      }

      // Optional reminder (only when new contact and reminder title + follow-up set)
      if (!contact && form.reminder_title?.trim() && form.next_follow_up_date) {
        await supabase.from("reminders").insert({
          user_id: user.id,
          contact_id: savedId,
          title: form.reminder_title.trim(),
          due_date: form.next_follow_up_date,
          priority: form.priority || "medium",
        });
      }
    }

    setSaving(false);
    toast.success(contact ? "Contact updated" : "Contact added");
    onSaved();
    onOpenChange(false);
    if (!contact && navigateOnCreate && savedId) {
      navigate(`/app/people/${savedId}`);
    }
  };

  const remove = async () => {
    if (!contact?.id) return;
    setDeleting(true);
    const { error } = await supabase.from("contacts").delete().eq("id", contact.id);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Contact deleted");
    onSaved();
    onOpenChange(false);
  };

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle>
        </DialogHeader>
        {errorMsg && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm px-3 py-2">
            {errorMsg}
          </div>
        )}

        <div className="space-y-6 py-2">
          <Section title="Basic info">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" required><Input value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus /></Field>
              <Field label="Last name"><Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></Field>
              <Field label="Title"><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Product Designer" /></Field>
              <Field label="Company"><Input value={form.company} onChange={(e) => set("company", e.target.value)} /></Field>
              <Field label="City" className="col-span-2"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
            </div>
          </Section>

          <Section title="Contact info">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
              <Field label="LinkedIn URL" className="col-span-2" hint="Must start with https://">
                <Input placeholder="https://linkedin.com/in/…" value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="Relationship context">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority" className="col-span-2">
                <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {(allGroups ?? []).length > 0 && (
                <Field label="Groups" className="col-span-2" hint="Tap to add or remove">
                  <div className="flex flex-wrap gap-1.5">
                    {(allGroups ?? []).map((g: any) => {
                      const has = selectedGroups.has(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGroup(g.id)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${has ? "border-transparent" : "border-border text-muted-foreground hover:text-foreground"}`}
                          style={has ? { backgroundColor: (g.color ?? "#a78bfa") + "22", color: g.color ?? "#a78bfa" } : {}}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
              <Field label="Tags" className="col-span-2" hint="Free-form labels — e.g. mentor, alum, design.">
                <TagInput value={form.tags ?? []} onChange={(next) => set("tags", next)} />
              </Field>
              <Field label="Why this person matters" className="col-span-2" hint="One line you'll remember in 6 months.">
                <Textarea rows={2} value={form.why_matters} onChange={(e) => set("why_matters", e.target.value)} placeholder="Mentor from first job — opened doors in product design." />
              </Field>
              <Field label="Notes" className="col-span-2">
                <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything else worth remembering." />
              </Field>
            </div>
          </Section>

          <Section title="Important dates">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Birthday"><Input type="date" value={form.birthday} onChange={(e) => set("birthday", e.target.value)} /></Field>
              <Field label="Anniversary" hint="Work anniversary, friendship anniversary, etc."><Input type="date" value={form.anniversary} onChange={(e) => set("anniversary", e.target.value)} /></Field>
            </div>
          </Section>

          <Section title="Follow-up">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Last contacted"><Input type="date" value={form.last_contacted_at} onChange={(e) => set("last_contacted_at", e.target.value)} /></Field>
              <Field label="Next follow-up"><Input type="date" value={form.next_follow_up_date} onChange={(e) => set("next_follow_up_date", e.target.value)} /></Field>
              {!contact && (
                <Field label="Optional reminder title" className="col-span-2" hint="Creates a reminder for the follow-up date.">
                  <Input value={form.reminder_title} onChange={(e) => set("reminder_title", e.target.value)} placeholder="e.g. Send the article we discussed" disabled={!form.next_follow_up_date} />
                </Field>
              )}
            </div>
          </Section>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
          {contact ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1.5" />Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this contact?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove {contact.name} and their interactions, reminders, and group memberships. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={remove} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {deleting ? "Deleting…" : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : <span />}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="gradient-primary">{saving ? "Saving…" : contact ? "Save changes" : "Add contact"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
    {children}
  </div>
);

const Field = ({ label, children, className = "", required, hint }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-sm">
      {label}
      {required && <span className="text-primary ml-0.5">*</span>}
    </Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);
