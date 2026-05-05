import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, UserPlus, Loader2, AlertCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactDialog } from "@/components/ContactDialog";

const People = () => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const groupFilter = searchParams.get("group") ?? "all";
  const setGroupFilter = (v: string) => {
    if (v === "all") setSearchParams({});
    else setSearchParams({ group: v });
  };
  const qc = useQueryClient();

  const { data: allGroups } = useQuery({
    queryKey: ["all-groups"],
    queryFn: async () => (await supabase.from("groups").select("*").order("name")).data ?? [],
  });

  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, contact_groups(group_id, groups(name, color))")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    let list = contacts ?? [];
    if (groupFilter !== "all") {
      list = list.filter((c: any) => c.contact_groups?.some((cg: any) => cg.group_id === groupFilter));
    }
    if (q) {
      const t = q.toLowerCase();
      list = list.filter((c: any) =>
        [c.name, c.last_name, c.title, c.company, c.city, c.email, c.notes, ...(c.contact_groups?.map((cg: any) => cg.groups?.name) ?? [])]
          .filter(Boolean).join(" ").toLowerCase().includes(t)
      );
    }
    return list;
  }, [contacts, q, groupFilter]);

  const fullName = (c: any) => [c.name, c.last_name].filter(Boolean).join(" ");
  const activeGroupName = allGroups?.find((g: any) => g.id === groupFilter)?.name;

  return (
    <AppLayout>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">People</h1>
          <p className="text-muted-foreground mt-1">{contacts?.length ?? 0} contacts in your orbit</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gradient-primary"><Plus className="h-4 w-4 mr-2" />Add contact</Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, title, company, city, notes…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {(allGroups ?? []).map((g: any) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {groupFilter !== "all" && activeGroupName && (
          <Button variant="ghost" size="sm" onClick={() => setGroupFilter("all")}>
            <X className="h-4 w-4 mr-1" />Clear "{activeGroupName}"
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="surface-card p-10 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <p className="text-sm">Loading contacts…</p>
        </div>
      )}

      {error && (
        <div className="surface-card p-6 border border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Couldn't load contacts</p>
            <p className="text-sm opacity-80">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (contacts?.length ?? 0) === 0 && (
        <div className="surface-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary mx-auto grid place-items-center mb-4">
            <UserPlus className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Your orbit is empty</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Add the first person you want to keep in touch with — friends, founders, recruiters, anyone.</p>
          <Button onClick={() => setOpen(true)} className="gradient-primary mt-5"><Plus className="h-4 w-4 mr-2" />Add your first contact</Button>
        </div>
      )}

      {!isLoading && !error && (contacts?.length ?? 0) > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c: any) => (
            <Link key={c.id} to={`/app/people/${c.id}`} className="surface-card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full gradient-primary text-primary-foreground grid place-items-center font-semibold">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{fullName(c)}</p>
                  <p className="text-sm text-muted-foreground truncate">{[c.title, c.company].filter(Boolean).join(" · ") || "—"}</p>
                </div>
                {c.priority === "high" && (
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">High</span>
                )}
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
            <div className="col-span-full surface-card p-10 text-center text-muted-foreground">No contacts match "{q}".</div>
          )}
        </div>
      )}

      <ContactDialog open={open} onOpenChange={setOpen} onSaved={() => qc.invalidateQueries({ queryKey: ["contacts"] })} />
    </AppLayout>
  );
};

export default People;
