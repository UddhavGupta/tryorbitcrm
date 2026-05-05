import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, parseISO, setYear, differenceInDays } from "date-fns";
import { Cake, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";

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
  const { data: contacts } = useQuery({
    queryKey: ["dates-contacts"],
    queryFn: async () => (await supabase.from("contacts").select("*")).data ?? [],
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
      <h1 className="text-3xl font-semibold tracking-tight">Dates</h1>
      <p className="text-muted-foreground mt-1 mb-6">Birthdays and anniversaries across your network.</p>

      <div className="surface-card divide-y divide-border">
        {events.map((e, i) => {
          const days = differenceInDays(e.date, new Date());
          return (
            <Link key={i} to={`/app/people/${e.contact.id}`} className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-accent grid place-items-center"><e.icon className="h-4 w-4 text-accent-foreground" /></div>
              <div className="flex-1">
                <p className="font-medium">{e.contact.name}</p>
                <p className="text-sm text-muted-foreground">{e.type} · {format(e.date, "EEEE, MMMM d")}</p>
              </div>
              <span className="text-sm text-muted-foreground">{days === 0 ? "Today" : `in ${days}d`}</span>
            </Link>
          );
        })}
        {events.length === 0 && <div className="p-10 text-center text-muted-foreground">No birthdays or anniversaries on file.</div>}
      </div>
    </AppLayout>
  );
};

export default Dates;
