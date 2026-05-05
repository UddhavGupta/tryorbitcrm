import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const COLORS = ["#a78bfa", "#34d399", "#fb923c", "#60a5fa", "#f472b6", "#facc15"];

const Groups = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data } = await supabase
        .from("groups").select("*, contact_groups(contact_id, contacts(id, name))").order("name");
      return data ?? [];
    },
  });

  const create = async () => {
    if (!name.trim() || !user) return;
    const { error } = await supabase.from("groups").insert({ name, color, user_id: user.id });
    if (error) return toast.error(error.message);
    setName("");
    qc.invalidateQueries({ queryKey: ["groups"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete group?")) return;
    await supabase.from("groups").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["groups"] });
  };

  return (
    <AppLayout>
      <h1 className="text-3xl font-semibold tracking-tight">Groups</h1>
      <p className="text-muted-foreground mt-1 mb-6">Organize your orbit by context.</p>

      <div className="surface-card p-4 flex gap-2 mb-6">
        <Input placeholder="Group name (e.g. Investors)" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-1.5 items-center">
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} className={`h-6 w-6 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        <Button onClick={create} className="gradient-primary"><Plus className="h-4 w-4 mr-1" />Add</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(groups ?? []).map((g: any) => (
          <div key={g.id} className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: g.color }} />
                <h3 className="font-semibold">{g.name}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(g.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{g.contact_groups?.length ?? 0} members</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {g.contact_groups?.slice(0, 8).map((cg: any) => (
                <Link key={cg.contact_id} to={`/app/people/${cg.contact_id}`} className="text-xs px-2 py-0.5 rounded-full bg-secondary hover:bg-accent">
                  {cg.contacts?.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
        {(groups ?? []).length === 0 && <div className="col-span-full surface-card p-10 text-center text-muted-foreground">No groups yet.</div>}
      </div>
    </AppLayout>
  );
};

export default Groups;
