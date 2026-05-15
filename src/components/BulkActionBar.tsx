import { useState } from "react";
import { CheckCheck, FolderPlus, Tag, Flag, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { normalizeTag } from "@/lib/tags";

type Props = {
  selectedIds: string[];
  contacts: any[]; // for tag merging
  groups: any[];
  onClear: () => void;
};

export const BulkActionBar = ({ selectedIds, contacts, groups, onClear }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

  const count = selectedIds.length;
  if (count === 0) return null;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["contacts"] });
    qc.invalidateQueries({ queryKey: ["dashboard-contacts"] });
    qc.invalidateQueries({ queryKey: ["all-tags"] });
  };

  const wrap = async (label: string, fn: () => Promise<{ error: any } | void>) => {
    setBusy(true);
    try {
      const res = await fn();
      const error = (res as any)?.error;
      if (error) throw error;
      invalidate();
      toast.success(`${label} · ${count} contact${count === 1 ? "" : "s"}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't apply");
    } finally {
      setBusy(false);
    }
  };

  const setPriority = (priority: "high" | "medium" | "low") =>
    wrap(`Priority: ${priority}`, async () =>
      await supabase.from("contacts").update({ priority }).in("id", selectedIds)
    );

  const markContacted = () =>
    wrap("Marked contacted today", async () =>
      await supabase.from("contacts").update({ last_contacted_at: new Date().toISOString() }).in("id", selectedIds)
    );

  const removeAll = () =>
    wrap("Deleted", async () => await supabase.from("contacts").delete().in("id", selectedIds))
      .then(onClear);

  const addToGroup = async (gid: string) => {
    if (!user) return;
    setBusy(true);
    try {
      const existing = new Set<string>();
      contacts.forEach((c: any) => {
        if (selectedIds.includes(c.id) && c.contact_groups?.some((cg: any) => cg.group_id === gid)) {
          existing.add(c.id);
        }
      });
      const rows = selectedIds
        .filter((id) => !existing.has(id))
        .map((id) => ({ contact_id: id, group_id: gid, user_id: user.id }));
      if (rows.length === 0) {
        toast("All selected are already in this group");
        return;
      }
      const { error } = await supabase.from("contact_groups").insert(rows);
      if (error) throw error;
      invalidate();
      qc.invalidateQueries({ queryKey: ["all-groups"] });
      toast.success(`Added to group · ${rows.length} contact${rows.length === 1 ? "" : "s"}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't add to group");
    } finally {
      setBusy(false);
    }
  };

  const addTag = async () => {
    const tag = normalizeTag(tagDraft);
    if (!tag) return;
    setBusy(true);
    try {
      const updates = contacts
        .filter((c: any) => selectedIds.includes(c.id))
        .map((c: any) => {
          const current: string[] = c.tags ?? [];
          if (current.some((t) => t.toLowerCase() === tag.toLowerCase())) return null;
          return supabase.from("contacts").update({ tags: [...current, tag] }).eq("id", c.id);
        })
        .filter(Boolean) as Promise<any>[];
      if (updates.length === 0) { toast("All selected already have that tag"); return; }
      const results = await Promise.all(updates);
      const firstErr = results.find((r) => r.error);
      if (firstErr) throw firstErr.error;
      invalidate();
      toast.success(`Tagged "${tag}" · ${updates.length} contact${updates.length === 1 ? "" : "s"}`);
      setTagDraft("");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't tag");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]">
      <div className="surface-card shadow-[var(--shadow-elevated)] border-primary/30 px-3 py-2 flex items-center gap-1.5 flex-wrap">
        <span className="text-sm font-medium px-2">{count} selected</span>
        <span className="h-6 w-px bg-border mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" disabled={busy}><FolderPlus className="h-4 w-4 mr-1.5" />Group</Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1" align="center">
            {groups.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2">No groups yet.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {groups.map((g: any) => (
                  <button
                    key={g.id}
                    onClick={() => addToGroup(g.id)}
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-secondary text-sm flex items-center gap-2"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color ?? "#a78bfa" }} />
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" disabled={busy}><Tag className="h-4 w-4 mr-1.5" />Tag</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="center">
            <form onSubmit={(e) => { e.preventDefault(); addTag(); }} className="flex items-center gap-1.5">
              <Input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                placeholder="New or existing tag"
                className="h-8"
                autoFocus
              />
              <Button type="submit" size="sm" disabled={!tagDraft.trim() || busy}>Add</Button>
            </form>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={busy}><Flag className="h-4 w-4 mr-1.5" />Priority</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => setPriority("high")}>High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriority("medium")}>Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriority("low")}>Low</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={markContacted} disabled={busy}>
          <CheckCheck className="h-4 w-4 mr-1.5" />Mark contacted
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={busy} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1.5" />Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {count} contact{count === 1 ? "" : "s"}?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes them along with their interactions, reminders, and group memberships. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={removeAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <span className="h-6 w-px bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={onClear} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-1.5" />Clear</>}
        </Button>
      </div>
    </div>
  );
};
