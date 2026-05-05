import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { differenceInDays, parseISO } from "date-fns";
import { Pencil, Trash2, Users, ArrowRight, UserPlus, X, Check, Search, Flame, Bell, Snowflake } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Props = {
  open: boolean;
  groupId: string | null;
  onOpenChange: (o: boolean) => void;
  onEdit: (g: any) => void;
  onDeleted: () => void;
};

export const GroupDetailDialog = ({ open, groupId, onOpenChange, onEdit, onDeleted }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [addQuery, setAddQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const { data: group } = useQuery({
    queryKey: ["group-detail", groupId],
    enabled: open && !!groupId,
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").eq("id", groupId!).single();
      return data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["group-members", groupId],
    enabled: open && !!groupId,
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_groups")
        .select("contact_id, contacts(id, name, last_name, title, company, priority, last_contacted_at, cooling_days)")
        .eq("group_id", groupId!);
      return (data ?? []).map((r: any) => r.contacts).filter(Boolean);
    },
  });

  const { data: openReminders } = useQuery({
    queryKey: ["group-open-reminders", groupId],
    enabled: open && !!groupId && (members?.length ?? 0) > 0,
    queryFn: async () => {
      const ids = (members ?? []).map((m: any) => m.id);
      if (!ids.length) return new Set<string>();
      const { data } = await supabase.from("reminders").select("contact_id").in("contact_id", ids).eq("completed", false);
      const set = new Set<string>();
      (data ?? []).forEach((r: any) => r.contact_id && set.add(r.contact_id));
      return set;
    },
  });

  const { data: allContacts } = useQuery({
    queryKey: ["contacts-min"],
    enabled: open,
    queryFn: async () => (await supabase.from("contacts").select("id, name, last_name").order("name")).data ?? [],
  });

  const memberIds = useMemo(() => new Set((members ?? []).map((m: any) => m.id)), [members]);
  const candidates = useMemo(() => {
    const t = addQuery.toLowerCase().trim();
    return (allContacts ?? []).filter((c: any) => !memberIds.has(c.id) && (!t || [c.name, c.last_name].filter(Boolean).join(" ").toLowerCase().includes(t))).slice(0, 50);
  }, [allContacts, memberIds, addQuery]);

  const stats = useMemo(() => {
    const today = new Date();
    let high = 0, cooling = 0;
    (members ?? []).forEach((m: any) => {
      if (m.priority === "high") high++;
      if (m.last_contacted_at) {
        const days = differenceInDays(today, parseISO(m.last_contacted_at));
        if (days >= (m.cooling_days ?? 30)) cooling++;
      } else {
        cooling++;
      }
    });
    return { high, cooling, openReminders: openReminders?.size ?? 0 };
  }, [members, openReminders]);

  const addMember = async (contactId: string) => {
    if (!user || !groupId) return;
    const { error } = await supabase.from("contact_groups").insert({ contact_id: contactId, group_id: groupId, user_id: user.id });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["group-members", groupId] });
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["contacts"] });
    toast.success("Added to group");
  };

  const removeMember = async (contactId: string) => {
    if (!groupId) return;
    const { error } = await supabase.from("contact_groups").delete().eq("contact_id", contactId).eq("group_id", groupId);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["group-members", groupId] });
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["contacts"] });
  };

  const remove = async () => {
    if (!groupId) return;
    await supabase.from("contact_groups").delete().eq("group_id", groupId);
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["contacts"] });
    qc.invalidateQueries({ queryKey: ["all-groups"] });
    toast.success("Group deleted");
    onDeleted();
    onOpenChange(false);
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
            <DialogTitle className="truncate">{group.name}</DialogTitle>
          </div>
          {group.description && <p className="text-sm text-muted-foreground mt-1">{group.description}</p>}
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          <Stat icon={Users} label="Members" value={members?.length ?? 0} />
          <Stat icon={Flame} label="High priority" value={stats.high} />
          <Stat icon={Bell} label="Open reminders" value={stats.openReminders} />
          <Stat icon={Snowflake} label="Cooling" value={stats.cooling} />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" className="gradient-primary"><UserPlus className="h-4 w-4 mr-1.5" />Add contact</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-8 h-9" placeholder="Search contacts…" value={addQuery} onChange={(e) => setAddQuery(e.target.value)} />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {candidates.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No contacts to add</p>
                ) : candidates.map((c: any) => (
                  <button key={c.id} onClick={() => addMember(c.id)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary flex items-center justify-between">
                    <span className="truncate">{[c.name, c.last_name].filter(Boolean).join(" ")}</span>
                    <Check className="h-3.5 w-3.5 opacity-0" />
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button size="sm" variant="outline" onClick={() => onEdit(group)}><Pencil className="h-4 w-4 mr-1.5" />Rename</Button>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/app/people?group=${group.id}`}><ArrowRight className="h-4 w-4 mr-1.5" />View all in People</Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive ml-auto">
                <Trash2 className="h-4 w-4 mr-1.5" />Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{group.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  The group will be removed from {members?.length ?? 0} contact{members?.length === 1 ? "" : "s"}. The contacts themselves are not deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Members</h3>
          {(members?.length ?? 0) === 0 ? (
            <div className="surface-card p-8 text-center">
              <p className="text-sm font-medium">No contacts in this group yet</p>
              <p className="text-xs text-muted-foreground mt-1">Use "Add contact" above to start filling it.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
              {members!.map((m: any) => {
                const days = m.last_contacted_at ? differenceInDays(new Date(), parseISO(m.last_contacted_at)) : null;
                const isCooling = days === null || days >= (m.cooling_days ?? 30);
                return (
                  <li key={m.id} className="px-3 py-2.5 flex items-center gap-3 bg-card">
                    <div className="h-8 w-8 rounded-full gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">{m.name?.charAt(0)}</div>
                    <Link to={`/app/people/${m.id}`} className="flex-1 min-w-0 hover:text-primary">
                      <p className="font-medium text-sm truncate">{[m.name, m.last_name].filter(Boolean).join(" ")}</p>
                      <p className="text-xs text-muted-foreground truncate">{[m.title, m.company].filter(Boolean).join(" · ") || "—"}</p>
                    </Link>
                    {m.priority === "high" && <span className="text-[10px] uppercase font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">High</span>}
                    {openReminders?.has(m.id) && <Bell className="h-3.5 w-3.5 text-primary" />}
                    {isCooling && <Snowflake className="h-3.5 w-3.5 text-warning" />}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeMember(m.id)} title="Remove from group">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Stat = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
    <p className="text-lg font-semibold mt-0.5">{value}</p>
  </div>
);
