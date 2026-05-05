import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, UsersRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { GroupDialog } from "@/components/GroupDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CardListSkeleton, ErrorState } from "@/components/LoadingStates";
import { toast } from "sonner";

const Groups = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*, contact_groups(contact_id, contacts(id, name, last_name))")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const remove = async (id: string) => {
    // Remove join rows first; contacts are untouched
    await supabase.from("contact_groups").delete().eq("group_id", id);
    const { error } = await supabase.from("groups").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["contacts"] });
    qc.invalidateQueries({ queryKey: ["all-groups"] });
    toast.success("Group deleted");
  };

  return (
    <AppLayout>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Groups</h1>
          <p className="text-muted-foreground mt-1">Organize your orbit by context.</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />New group
        </Button>
      </div>

      {isLoading && <CardListSkeleton count={3} />}

      {error && <ErrorState title="Couldn't load groups" message={(error as Error).message} />}

      {!isLoading && !error && (groups?.length ?? 0) === 0 && (
        <div className="surface-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary mx-auto grid place-items-center mb-4">
            <UsersRound className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No groups yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Group people by context — investors, friends, recruiters, founders — to filter your orbit fast.</p>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gradient-primary mt-5">
            <Plus className="h-4 w-4 mr-2" />Create your first group
          </Button>
        </div>
      )}

      {!isLoading && !error && (groups?.length ?? 0) > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups!.map((g: any) => (
            <div key={g.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                  <Link to={`/app/people?group=${g.id}`} className="font-semibold truncate hover:text-primary">{g.name}</Link>
                </div>
                <div className="flex shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(g); setDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{g.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The group will be removed from {g.contact_groups?.length ?? 0} contact{g.contact_groups?.length === 1 ? "" : "s"}. The contacts themselves are not deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(g.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{g.contact_groups?.length ?? 0} member{g.contact_groups?.length === 1 ? "" : "s"}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.contact_groups?.slice(0, 10).map((cg: any) => (
                  <Link key={cg.contact_id} to={`/app/people/${cg.contact_id}`}
                    className="text-xs px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: (g.color ?? "#a78bfa") + "22", color: g.color ?? "#a78bfa" }}>
                    {[cg.contacts?.name, cg.contacts?.last_name].filter(Boolean).join(" ")}
                  </Link>
                ))}
                {g.contact_groups?.length > 10 && (
                  <span className="text-xs text-muted-foreground px-2 py-0.5">+{g.contact_groups.length - 10} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <GroupDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        group={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["groups"] })}
      />
    </AppLayout>
  );
};

export default Groups;
