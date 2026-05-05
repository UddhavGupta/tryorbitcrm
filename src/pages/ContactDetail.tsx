import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, differenceInDays } from "date-fns";
import { ArrowLeft, Cake, Linkedin, Mail, MapPin, Pencil, Phone, Plus, Trash2, Loader2, AlertCircle, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ContactDialog } from "@/components/ContactDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const ContactDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<any>(null);
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().slice(0, 10));

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

  const addInteraction = async () => {
    if (!note.trim() || !user) return;
    await supabase.from("interactions").insert({ user_id: user.id, contact_id: id!, kind: "note", note });
    await supabase.from("contacts").update({ last_contacted_at: new Date().toISOString() }).eq("id", id!);
    setNote("");
    qc.invalidateQueries({ queryKey: ["interactions", id] });
    qc.invalidateQueries({ queryKey: ["contact", id] });
    toast.success("Logged");
  };

  const addReminder = async () => {
    if (!reminderTitle.trim() || !user) return;
    await supabase.from("reminders").insert({ user_id: user.id, contact_id: id!, title: reminderTitle, due_date: reminderDate });
    setReminderTitle("");
    qc.invalidateQueries({ queryKey: ["contact-reminders", id] });
    toast.success("Reminder added");
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

          {contact.notes && (
            <div className="surface-card p-6">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="surface-card p-6">
            <h3 className="font-semibold mb-3">Log interaction</h3>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you talk about?" />
            <div className="mt-3 flex justify-end"><Button onClick={addInteraction} className="gradient-primary"><Plus className="h-4 w-4 mr-2" />Log</Button></div>
            <div className="mt-6 space-y-3">
              {(interactions ?? []).map((i: any) => (
                <div key={i.id} className="flex gap-3 items-start">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">{i.note}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{format(parseISO(i.occurred_at), "MMM d, yyyy · h:mm a")}</p>
                  </div>
                </div>
              ))}
              {(interactions ?? []).length === 0 && <p className="text-sm text-muted-foreground">No history yet.</p>}
            </div>
          </div>

          <div className="surface-card p-6">
            <h3 className="font-semibold mb-3">Reminders</h3>
            <div className="flex gap-2">
              <Input placeholder="Follow up about…" value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} />
              <Input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-44" />
              <Button onClick={addReminder} className="gradient-primary"><Plus className="h-4 w-4" /></Button>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {(reminders ?? []).map((r: any) => (
                <li key={r.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={r.completed} onChange={async () => {
                      await supabase.from("reminders").update({ completed: !r.completed }).eq("id", r.id);
                      qc.invalidateQueries({ queryKey: ["contact-reminders", id] });
                    }} />
                    <span className={r.completed ? "line-through text-muted-foreground" : ""}>{r.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(parseISO(r.due_date), "MMM d")}</span>
                </li>
              ))}
              {(reminders ?? []).length === 0 && <p className="text-sm text-muted-foreground py-2">No reminders.</p>}
            </ul>
          </div>
        </div>
      </div>

      <ContactDialog open={editing} onOpenChange={setEditing} contact={contact} onSaved={() => qc.invalidateQueries({ queryKey: ["contact", id] })} />
    </AppLayout>
  );
};

const Row = ({ icon: Icon, children }: any) => (
  <div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /><span className="text-foreground">{children}</span></div>
);

export default ContactDetail;
