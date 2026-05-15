import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, UsersRound, Flame, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { GroupDialog } from "@/components/GroupDialog";
import { GroupDetailDialog } from "@/components/GroupDetailDialog";
import { CardListSkeleton, ErrorState } from "@/components/LoadingStates";
import { PageHeader } from "@/components/PageHeader";

const Groups = () => {
  const qc = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*, contact_groups(contact_id, contacts(id, name, last_name, priority))")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: openReminderContactIds } = useQuery({
    queryKey: ["open-reminders-by-contact"],
    queryFn: async () => {
      const { data } = await supabase.from("reminders").select("contact_id").eq("completed", false);
      const set = new Set<string>();
      (data ?? []).forEach((r: any) => r.contact_id && set.add(r.contact_id));
      return set;
    },
  });

  const cards = useMemo(() => {
    return (groups ?? []).map((g: any) => {
      const cgs = g.contact_groups ?? [];
      const high = cgs.filter((cg: any) => cg.contacts?.priority === "high").length;
      const reminders = cgs.filter((cg: any) => openReminderContactIds?.has(cg.contact_id)).length;
      return { ...g, _high: high, _reminders: reminders, _count: cgs.length };
    });
  }, [groups, openReminderContactIds]);

  return (
    <AppLayout>
      <PageHeader
        title="Groups"
        description="Organize your orbit by context — investors, friends, recruiters, founders."
        actions={
          <Button onClick={() => { setEditing(null); setEditorOpen(true); }} className="gradient-primary w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />New group
          </Button>
        }
      />

      {isLoading && <CardListSkeleton count={3} />}
      {error && <ErrorState title="Couldn't load groups" message={(error as Error).message} />}

      {!isLoading && !error && cards.length === 0 && (
        <div className="surface-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary mx-auto grid place-items-center mb-4">
            <UsersRound className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No groups yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Group people by context to filter your orbit fast.</p>
          <Button onClick={() => { setEditing(null); setEditorOpen(true); }} className="gradient-primary mt-5">
            <Plus className="h-4 w-4 mr-2" />Create your first group
          </Button>
        </div>
      )}

      {!isLoading && !error && cards.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((g: any) => {
            const visible = (g.contact_groups ?? []).slice(0, 6);
            const extra = (g.contact_groups?.length ?? 0) - visible.length;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setDetailId(g.id)}
                className="surface-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] hover:border-primary/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                  <span className="font-semibold truncate">{g.name}</span>
                </div>
                {g.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</p>}

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><UsersRound className="h-3.5 w-3.5" />{g._count}</span>
                  {g._high > 0 && <span className="inline-flex items-center gap-1 text-primary"><Flame className="h-3.5 w-3.5" />{g._high}</span>}
                  {g._reminders > 0 && <span className="inline-flex items-center gap-1 text-primary"><Bell className="h-3.5 w-3.5" />{g._reminders}</span>}
                </div>

                {g._count === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground italic">No contacts yet — open to add some.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {visible.map((cg: any) => (
                      <span key={cg.contact_id}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: (g.color ?? "#a78bfa") + "22", color: g.color ?? "#a78bfa" }}>
                        {[cg.contacts?.name, cg.contacts?.last_name].filter(Boolean).join(" ")}
                      </span>
                    ))}
                    {extra > 0 && (
                      <span className="text-xs text-muted-foreground px-2 py-0.5">+{extra} more</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <GroupDialog
        open={editorOpen}
        onOpenChange={(o) => { setEditorOpen(o); if (!o) setEditing(null); }}
        group={editing}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["groups"] });
          if (detailId) qc.invalidateQueries({ queryKey: ["group-detail", detailId] });
        }}
      />

      <GroupDetailDialog
        open={detailId !== null}
        groupId={detailId}
        onOpenChange={(o) => { if (!o) setDetailId(null); }}
        onEdit={(g) => { setEditing(g); setEditorOpen(true); }}
        onDeleted={() => setDetailId(null)}
      />
    </AppLayout>
  );
};

export default Groups;
