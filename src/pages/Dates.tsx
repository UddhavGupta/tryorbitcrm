import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, parseISO, setYear, differenceInDays } from "date-fns";
import { Cake, Heart, Loader2, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { ErrorState } from "@/components/LoadingStates";

function nextOccurrence(dateStr: string) {
  const d = parseISO(dateStr);
  const today = new Date();
  let next = setYear(d, today.getFullYear());
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next = setYear(d, today.getFullYear() + 1);
  }
  return next;
}

const Dates = () => {
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ["dates-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const events = (contacts ?? [])
    .flatMap((c: any) => {
      const arr: any[] = [];
      if (c.birthday) arr.push({ contact: c, type: "Birthday", icon: Cake, original: c.birthday, date: nextOccurrence(c.birthday) });
      if (c.anniversary) arr.push({ contact: c, type: "Anniversary", icon: Heart, original: c.anniversary, date: nextOccurrence(c.anniversary) });
      return arr;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dates</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Birthdays and anniversaries across your network.</p>
      </div>

      {isLoading && (
        <div className="surface-card p-10 flex flex-col items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" /><p className="text-sm">Loading dates…</p>
        </div>
      )}

      {error && <ErrorState title="Couldn't load dates" message={(error as Error).message} />}

      {!isLoading && !error && events.length === 0 && (
        <div className="surface-card p-12 text-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary mx-auto grid place-items-center mb-4">
            <CalendarDays className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No dates yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
            Add a birthday or anniversary on a contact and it'll appear here, sorted by what's coming up next.
          </p>
        </div>
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="surface-card divide-y divide-border">
          {events.map((e, i) => {
            const days = differenceInDays(e.date, new Date());
            return (
              <Link key={i} to={`/app/people/${e.contact.id}`} className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-accent grid place-items-center"><e.icon className="h-4 w-4 text-accent-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{[e.contact.name, e.contact.last_name].filter(Boolean).join(" ")}</p>
                  <p className="text-sm text-muted-foreground truncate">{e.type} · {format(e.date, "EEEE, MMMM d")}</p>
                </div>
                <span className={`text-sm whitespace-nowrap ${days === 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {days === 0 ? "Today" : `in ${days}d`}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Dates;
