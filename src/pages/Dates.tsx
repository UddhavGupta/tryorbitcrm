import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, parseISO, setYear, differenceInDays } from "date-fns";
import { Cake, Heart, CalendarDays, Plus, ArrowDownAZ, ArrowUpAZ, Sparkles, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { ErrorState, RowListSkeleton } from "@/components/LoadingStates";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { DateDialog } from "@/components/DateDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

function nextOccurrence(dateStr: string, recurring = true) {
  const d = parseISO(dateStr);
  if (!recurring) return d;
  const today = new Date();
  let next = setYear(d, today.getFullYear());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next = setYear(d, today.getFullYear() + 1);
  }
  return next;
}

const typeIcon = (t: string) => t === "birthday" ? Cake : t === "anniversary" ? Heart : t === "milestone" ? Sparkles : CalendarDays;

const Dates = () => {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data: contacts, isLoading: loadingContacts, error } = useQuery({
    queryKey: ["dates-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: customDates, isLoading: loadingCustom } = useQuery({
    queryKey: ["custom-dates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_dates").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const isLoading = loadingContacts || loadingCustom;

  const events = useMemo(() => {
    const fromContacts = (contacts ?? []).flatMap((c: any) => {
      const arr: any[] = [];
      if (c.birthday) arr.push({ kind: "contact", contact: c, type: "Birthday", icon: Cake, original: c.birthday, date: nextOccurrence(c.birthday), title: [c.name, c.last_name].filter(Boolean).join(" ") });
      if (c.anniversary) arr.push({ kind: "contact", contact: c, type: "Anniversary", icon: Heart, original: c.anniversary, date: nextOccurrence(c.anniversary), title: [c.name, c.last_name].filter(Boolean).join(" ") });
      return arr;
    });
    const contactMap = new Map((contacts ?? []).map((c: any) => [c.id, c]));
    const fromCustom = (customDates ?? []).map((r: any) => {
      const contact = r.contact_id ? contactMap.get(r.contact_id) : null;
      const Icon = typeIcon(r.event_type);
      return {
        kind: "custom",
        record: r,
        contact,
        type: r.event_type.charAt(0).toUpperCase() + r.event_type.slice(1),
        icon: Icon,
        original: r.event_date,
        date: nextOccurrence(r.event_date, r.recurring),
        title: r.title,
      };
    });
    const all = [...fromContacts, ...fromCustom];
    all.sort((a, b) => sortDir === "asc" ? a.date.getTime() - b.date.getTime() : b.date.getTime() - a.date.getTime());
    return all;
  }, [contacts, customDates, sortDir]);

  const onDelete = async (id: string) => {
    const { error } = await supabase.from("custom_dates").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Date removed");
    qc.invalidateQueries({ queryKey: ["custom-dates"] });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Dates"
        description="Birthdays, anniversaries, and any custom dates across your network."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
              title={`Sorted ${sortDir === "asc" ? "ascending" : "descending"}`}
            >
              {sortDir === "asc" ? <ArrowDownAZ className="h-4 w-4 mr-2" /> : <ArrowUpAZ className="h-4 w-4 mr-2" />}
              {sortDir === "asc" ? "Soonest first" : "Latest first"}
            </Button>
            <Button className="gradient-primary" onClick={() => { setEditing(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add date
            </Button>
          </>
        }
      />

      {isLoading && <RowListSkeleton count={6} />}

      {error && <ErrorState title="Couldn't load dates" message={(error as Error).message} />}

      {!isLoading && !error && events.length === 0 && (
        <div className="surface-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary mx-auto grid place-items-center mb-4">
            <CalendarDays className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No dates yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
            Add a birthday, anniversary, or any custom date — connect it to a contact or keep it standalone.
          </p>
          <Button className="mt-4 gradient-primary" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add your first date
          </Button>
        </div>
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="surface-card divide-y divide-border">
          {events.map((e, i) => {
            const days = differenceInDays(e.date, new Date());
            const Row = (
              <div className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-accent grid place-items-center"><e.icon className="h-4 w-4 text-accent-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {e.title}
                    {e.kind === "custom" && e.contact && (
                      <span className="text-muted-foreground font-normal"> · {[e.contact.name, e.contact.last_name].filter(Boolean).join(" ")}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{e.type} · {format(e.date, "EEEE, MMMM d")}</p>
                </div>
                <span className={`text-sm whitespace-nowrap ${days === 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {days === 0 ? "Today" : days < 0 ? `${Math.abs(days)}d ago` : `in ${days}d`}
                </span>
                {e.kind === "custom" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(ev) => ev.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(e.record); setDialogOpen(true); }}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(e.record.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
            const linkTo = e.kind === "contact" ? `/app/people/${e.contact.id}` : (e.contact ? `/app/people/${e.contact.id}` : null);
            return linkTo ? (
              <Link key={i} to={linkTo} className="block">{Row}</Link>
            ) : (
              <div key={i}>{Row}</div>
            );
          })}
        </div>
      )}

      <DateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["custom-dates"] })}
      />
    </AppLayout>
  );
};

export default Dates;
