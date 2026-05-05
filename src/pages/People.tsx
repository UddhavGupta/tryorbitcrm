import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactDialog } from "@/components/ContactDialog";

const People = () => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: contacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("contacts").select("*, contact_groups(group_id, groups(name, color))").order("name");
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!q) return contacts ?? [];
    const t = q.toLowerCase();
    return (contacts ?? []).filter((c: any) =>
      [c.name, c.title, c.company, c.city, c.notes, ...(c.contact_groups?.map((cg: any) => cg.groups?.name) ?? [])]
        .filter(Boolean).join(" ").toLowerCase().includes(t)
    );
  }, [contacts, q]);

  return (
    <AppLayout>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">People</h1>
          <p className="text-muted-foreground mt-1">{contacts?.length ?? 0} contacts in your orbit</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gradient-primary"><Plus className="h-4 w-4 mr-2" />Add contact</Button>
      </div>

      <div className="relative mb-6">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, title, company, city, notes…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c: any) => (
          <Link key={c.id} to={`/app/people/${c.id}`} className="surface-card p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full gradient-primary text-primary-foreground grid place-items-center font-semibold">
                {c.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{c.name}</p>
                <p className="text-sm text-muted-foreground truncate">{[c.title, c.company].filter(Boolean).join(" · ") || "—"}</p>
              </div>
            </div>
            {c.contact_groups?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.contact_groups.map((cg: any) => (
                  <span key={cg.group_id} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (cg.groups?.color ?? "#a78bfa") + "22", color: cg.groups?.color ?? "#a78bfa" }}>
                    {cg.groups?.name}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full surface-card p-10 text-center text-muted-foreground">No contacts match.</div>
        )}
      </div>

      <ContactDialog open={open} onOpenChange={setOpen} onSaved={() => qc.invalidateQueries({ queryKey: ["contacts"] })} />
    </AppLayout>
  );
};

export default People;
