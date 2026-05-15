import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, differenceInDays, addDays, isAfter, isBefore } from "date-fns";
import { ArrowLeft, Cake, Linkedin, Mail, MapPin, Pencil, Phone, Plus, Trash2, Loader2, AlertCircle, CalendarClock, Bell, CheckCircle2, UserPlus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ContactDialog } from "@/components/ContactDialog";
import { InteractionDialog, interactionTypeLabel } from "@/components/InteractionDialog";
import { ReminderDialog, priorityClasses } from "@/components/ReminderDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { tagClasses } from "@/lib/tags";
import { Timeline } from "@/components/Timeline";
import {
  getRelationshipStatus, getSuggestedAction, STATUS_LABEL, STATUS_CLASSES,
  ACTION_LABEL, ACTION_CLASSES, INTEL_DISCLAIMER,
} from "@/lib/relationshipIntel";

const ContactDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<any>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);

  const { data: contact, isLoading, error } = useQuery({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*, contact_groups(group_id, groups(*))").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: interactions } = useQuery({
    queryKey: ["interactions", id],
    queryFn: async () => {
      const { data } = await supabase.from("interactions").select("*").eq("contact_id", id!).order("occurred_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: reminders } = useQuery({
    queryKey: ["contact-reminders", id],
    queryFn: async () => {
      const { data } = await supabase.from("reminders").select("*").eq("contact_id", id!).order("due_date");
      return data ?? [];
    },
  });

  const { data: groups } = useQuery({
    queryKey: ["all-groups"],
    queryFn: async () => (await supabase.from("groups").select("*").order("name")).data ?? [],
  });

  if (isLoading) return <AppLayout><div className="surface-card p-10 flex flex-col items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mb-2" /><p className="text-sm">Loading contact…</p></div></AppLayout>;
  if (error || !contact) return <AppLayout><div className="surface-card p-6 border border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3"><AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /><div><p className="font-medium">Couldn't load contact</p><p className="text-sm opacity-80">{(error as Error)?.message ?? "Not found"}</p></div></div></AppLayout>;

  const refreshInteractions = () => {
    qc.invalidateQueries({ queryKey: ["interactions", id] });
    qc.invalidateQueries({ queryKey: ["contact", id] });
  };

  const deleteInteraction = async (iid: string) => {
    const { error } = await supabase.from("interactions").delete().eq("id", iid);
    if (error) return toast.error(error.message);
    refreshInteractions();
    toast.success("Interaction deleted");
  };



  const toggleGroup = async (gid: string, has: boolean) => {
    if (!user) return;
    if (has) await supabase.from("contact_groups").delete().eq("contact_id", id!).eq("group_id", gid);
    else await supabase.from("contact_groups").insert({ contact_id: id!, group_id: gid, user_id: user.id });
    qc.invalidateQueries({ queryKey: ["contact", id] });
  };

  const remove = async () => {
    const { error } = await supabase.from("contacts").delete().eq("id", id!);
    if (error) return toast.error(error.message);
    toast.success("Contact deleted");
    navigate("/app/people");
  };

  const days = contact.last_contacted_at ? differenceInDays(new Date(), parseISO(contact.last_contacted_at)) : null;
  const groupIds = new Set(contact.contact_groups?.map((cg: any) => cg.group_id) ?? []);
  const status = getRelationshipStatus(contact.last_contacted_at);
  const earliestOpenReminder = (reminders ?? []).find((r: any) => !r.completed)?.due_date ?? null;
  const action = getSuggestedAction({
    priority: contact.priority,
    last_contacted_at: contact.last_contacted_at,
    birthday: contact.birthday,
    nextOpenReminderDue: earliestOpenReminder,
  });

  return (
    <AppLayout>
      <Button variant="ghost" asChild className="mb-4 -ml-3"><Link to="/app/people"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="surface-card p-6 text-center">
            <div className="h-20 w-20 rounded-full mx-auto gradient-primary text-primary-foreground grid place-items-center text-2xl font-semibold">
              {contact.name.charAt(0)}
            </div>
            <h1 className="mt-4 text-xl font-semibold">{[contact.name, contact.last_name].filter(Boolean).join(" ")}</h1>
            <p className="text-sm text-muted-foreground">{[contact.title, contact.company].filter(Boolean).join(" · ")}</p>
            {contact.priority && contact.priority !== "medium" && (
              <span className={`inline-block mt-2 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full ${contact.priority === "high" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {contact.priority} priority
              </span>
            )}
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <span className={`text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-full border ${STATUS_CLASSES[status]}`}>{STATUS_LABEL[status]}</span>
              <span className={`text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-full border ${ACTION_CLASSES[action]}`}>{ACTION_LABEL[action]}</span>
            </div>
            {(contact.tags?.length ?? 0) > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {(contact.tags as string[]).map((t) => (
                  <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${tagClasses(t)}`}>{t}</span>
                ))}
              </div>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground italic px-2 leading-relaxed">{INTEL_DISCLAIMER}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline"><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
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
                    <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="mt-6 space-y-2 text-sm text-left">
              {contact.email && <Row icon={Mail}>{contact.email}</Row>}
              {contact.phone && <Row icon={Phone}>{contact.phone}</Row>}
              {contact.city && <Row icon={MapPin}>{contact.city}</Row>}
              {contact.linkedin_url && <Row icon={Linkedin}><a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate inline-block max-w-[200px] align-bottom">LinkedIn</a></Row>}
              {contact.birthday && <Row icon={Cake}>{format(parseISO(contact.birthday), "MMMM d")}</Row>}
              {contact.next_follow_up_date && <Row icon={CalendarClock}>Follow up {format(parseISO(contact.next_follow_up_date), "MMM d, yyyy")}</Row>}
              {days !== null && (
                <div className="pt-2 text-xs text-muted-foreground">
                  Last contact: {days} day{days === 1 ? "" : "s"} ago {days >= contact.cooling_days && <span className="text-warning font-medium">· cooling</span>}
                </div>
              )}
            </div>
          </div>

          <div className="surface-card p-6">
            <h3 className="font-semibold mb-3">Groups</h3>
            <div className="flex flex-wrap gap-2">
              {(groups ?? []).map((g: any) => {
                const has = groupIds.has(g.id);
                return (
                  <button key={g.id} onClick={() => toggleGroup(g.id, has)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${has ? "border-transparent" : "border-border text-muted-foreground"}`}
                    style={has ? { backgroundColor: (g.color ?? "#a78bfa") + "22", color: g.color ?? "#a78bfa" } : {}}>
                    {g.name}
                  </button>
                );
              })}
              {(groups ?? []).length === 0 && <p className="text-sm text-muted-foreground">No groups yet. <Link to="/app/groups" className="text-primary">Create one</Link>.</p>}
            </div>
          </div>

          {contact.why_matters && (
            <div className="surface-card p-6">
              <h3 className="font-semibold mb-2">Why they matter</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.why_matters}</p>
            </div>
          )}

          {contact.notes && (
            <div className="surface-card p-6">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Timeline
            contact={contact}
            interactions={interactions ?? []}
            reminders={reminders ?? []}
            onLogInteraction={() => { setEditingInteraction(null); setInteractionOpen(true); }}
            onNewReminder={() => { setEditingReminder(null); setReminderOpen(true); }}
            onEditInteraction={(i) => { setEditingInteraction(i); setInteractionOpen(true); }}
            onDeleteInteraction={deleteInteraction}
            onEditReminder={(r) => { setEditingReminder(r); setReminderOpen(true); }}
            onToggleReminder={async (r) => {
              await supabase.from("reminders").update({ completed: !r.completed }).eq("id", r.id);
              qc.invalidateQueries({ queryKey: ["contact-reminders", id] });
              qc.invalidateQueries({ queryKey: ["reminders"] });
              qc.invalidateQueries({ queryKey: ["reminders-today"] });
            }}
            onDeleteReminder={async (r) => {
              await supabase.from("reminders").delete().eq("id", r.id);
              qc.invalidateQueries({ queryKey: ["contact-reminders", id] });
              qc.invalidateQueries({ queryKey: ["reminders"] });
              qc.invalidateQueries({ queryKey: ["reminders-today"] });
              toast.success("Reminder deleted");
            }}
          />
        </div>
      </div>

      <ContactDialog open={editing} onOpenChange={setEditing} contact={contact} onSaved={() => qc.invalidateQueries({ queryKey: ["contact", id] })} />
      <InteractionDialog
        open={interactionOpen}
        onOpenChange={(o) => { setInteractionOpen(o); if (!o) setEditingInteraction(null); }}
        contactId={id!}
        interaction={editingInteraction}
        onSaved={refreshInteractions}
      />
      <ReminderDialog
        open={reminderOpen}
        onOpenChange={(o) => { setReminderOpen(o); if (!o) setEditingReminder(null); }}
        reminder={editingReminder}
        defaultContactId={id!}
        lockContact
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["contact-reminders", id] });
          qc.invalidateQueries({ queryKey: ["reminders"] });
          qc.invalidateQueries({ queryKey: ["reminders-today"] });
        }}
      />
    </AppLayout>
  );
};

const Row = ({ icon: Icon, children }: any) => (
  <div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /><span className="text-foreground">{children}</span></div>
);

export default ContactDetail;
