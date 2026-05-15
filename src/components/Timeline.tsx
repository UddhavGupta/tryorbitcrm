import { useMemo } from "react";
import { format, parseISO, addDays, isAfter, isBefore, differenceInCalendarDays } from "date-fns";
import { Bell, CheckCircle2, Cake, Pencil, Plus, Trash2, UserPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { interactionTypeLabel } from "@/components/InteractionDialog";
import { priorityClasses } from "@/components/ReminderDialog";

type Props = {
  contact: any;
  interactions: any[];
  reminders: any[];
  onLogInteraction: () => void;
  onNewReminder: () => void;
  onEditInteraction: (i: any) => void;
  onDeleteInteraction: (id: string) => void | Promise<void>;
  onEditReminder: (r: any) => void;
  onToggleReminder: (r: any) => void | Promise<void>;
  onDeleteReminder: (r: any) => void | Promise<void>;
};

type Event =
  | { kind: "interaction"; date: Date; data: any }
  | { kind: "reminder"; date: Date; data: any }
  | { kind: "created"; date: Date; data: any }
  | { kind: "birthday"; date: Date; data: { label: string; original: string } }
  | { kind: "anniversary"; date: Date; data: { label: string; original: string } };

const nextOccurrence = (mmdd: string, fromDate = new Date()): Date | null => {
  if (!mmdd) return null;
  const orig = parseISO(mmdd);
  if (isNaN(orig.getTime())) return null;
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  let next = new Date(today.getFullYear(), orig.getMonth(), orig.getDate());
  if (isBefore(next, today)) next = new Date(today.getFullYear() + 1, orig.getMonth(), orig.getDate());
  return next;
};

const relativeLabel = (d: Date) => {
  const diff = differenceInCalendarDays(d, new Date());
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `In ${diff} day${diff === 1 ? "" : "s"}`;
  return `${Math.abs(diff)} day${diff === -1 ? "" : "s"} ago`;
};

export const Timeline = ({
  contact, interactions, reminders,
  onLogInteraction, onNewReminder,
  onEditInteraction, onDeleteInteraction,
  onEditReminder, onToggleReminder, onDeleteReminder,
}: Props) => {
  const events = useMemo<Event[]>(() => {
    const list: Event[] = [];

    interactions.forEach((i) => list.push({ kind: "interaction", date: parseISO(i.occurred_at), data: i }));
    reminders.forEach((r) => list.push({ kind: "reminder", date: parseISO(r.due_date), data: r }));

    if (contact.created_at) {
      list.push({ kind: "created", date: parseISO(contact.created_at), data: contact });
    }

    const horizon = addDays(new Date(), 90);
    if (contact.birthday) {
      const d = nextOccurrence(contact.birthday);
      if (d && isBefore(d, horizon)) list.push({ kind: "birthday", date: d, data: { label: "Birthday", original: contact.birthday } });
    }
    if (contact.anniversary) {
      const d = nextOccurrence(contact.anniversary);
      if (d && isBefore(d, horizon)) list.push({ kind: "anniversary", date: d, data: { label: "Anniversary", original: contact.anniversary } });
    }

    list.sort((a, b) => b.date.getTime() - a.date.getTime());
    return list;
  }, [contact, interactions, reminders]);

  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="font-semibold">Timeline</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onNewReminder}><Bell className="h-4 w-4 mr-1.5" />New reminder</Button>
          <Button size="sm" onClick={onLogInteraction} className="gradient-primary"><Plus className="h-4 w-4 mr-1.5" />Log interaction</Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          <p>Nothing logged yet.</p>
          <p className="mt-1">Log a conversation, intro, or set a reminder to start the timeline.</p>
        </div>
      ) : (
        <ol className="space-y-5 border-l border-border ml-1.5">
          {events.map((e, idx) => (
            <li key={`${e.kind}-${idx}`} className="relative pl-5">
              <Dot kind={e.kind} />
              <Item event={e}
                onEditInteraction={onEditInteraction}
                onDeleteInteraction={onDeleteInteraction}
                onEditReminder={onEditReminder}
                onToggleReminder={onToggleReminder}
                onDeleteReminder={onDeleteReminder}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const Dot = ({ kind }: { kind: Event["kind"] }) => {
  const styles: Record<Event["kind"], string> = {
    interaction: "bg-primary",
    reminder: "bg-amber-500",
    created: "bg-muted-foreground/40",
    birthday: "bg-pink-500",
    anniversary: "bg-violet-500",
  };
  return <div className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full ring-4 ring-background ${styles[kind]}`} />;
};

const Item = ({ event, onEditInteraction, onDeleteInteraction, onEditReminder, onToggleReminder, onDeleteReminder }: {
  event: Event;
  onEditInteraction: (i: any) => void;
  onDeleteInteraction: (id: string) => void | Promise<void>;
  onEditReminder: (r: any) => void;
  onToggleReminder: (r: any) => void | Promise<void>;
  onDeleteReminder: (r: any) => void | Promise<void>;
}) => {
  const dateLabel = format(event.date, "MMM d, yyyy");
  const rel = relativeLabel(event.date);

  if (event.kind === "interaction") {
    const i = event.data;
    return (
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{interactionTypeLabel(i.kind)}</span>
            <span className="text-xs text-muted-foreground">{dateLabel} · {rel}</span>
          </div>
          {i.note && <p className="text-sm mt-2 whitespace-pre-wrap">{i.note}</p>}
          {i.next_steps && (
            <div className="mt-2 rounded-md bg-secondary px-3 py-2 text-xs">
              <span className="font-semibold text-foreground">Next steps: </span>
              <span className="text-muted-foreground whitespace-pre-wrap">{i.next_steps}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEditInteraction(i)}><Pencil className="h-3.5 w-3.5" /></Button>
          <ConfirmDelete title="Delete this interaction?" onConfirm={() => onDeleteInteraction(i.id)} />
        </div>
      </div>
    );
  }

  if (event.kind === "reminder") {
    const r = event.data;
    return (
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Checkbox checked={r.completed} onCheckedChange={() => onToggleReminder(r)} className="mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wide font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full">Reminder</span>
              <span className="text-xs text-muted-foreground">{dateLabel} · {rel}</span>
              <span className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-full ${priorityClasses(r.priority)}`}>{r.priority}</span>
            </div>
            <p className={`text-sm mt-1.5 ${r.completed ? "line-through text-muted-foreground" : ""}`}>{r.title}</p>
            {r.notes && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{r.notes}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEditReminder(r)}><Pencil className="h-3.5 w-3.5" /></Button>
          <ConfirmDelete title="Delete this reminder?" onConfirm={() => onDeleteReminder(r)} />
        </div>
      </div>
    );
  }

  if (event.kind === "created") {
    return (
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Added to orbit</span>
          <span className="text-xs text-muted-foreground">{dateLabel} · {rel}</span>
        </div>
      </div>
    );
  }

  // birthday / anniversary
  const Icon = event.kind === "birthday" ? Cake : Sparkles;
  const label = event.kind === "birthday" ? "Birthday" : "Anniversary";
  const tone = event.kind === "birthday"
    ? "text-pink-700 dark:text-pink-300 bg-pink-500/15"
    : "text-violet-700 dark:text-violet-300 bg-violet-500/15";
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${tone}`}>
          <Icon className="h-3 w-3" />{label}
        </span>
        <span className="text-xs text-muted-foreground">{dateLabel} · {rel}</span>
      </div>
    </div>
  );
};

const ConfirmDelete = ({ title, onConfirm }: { title: string; onConfirm: () => void | Promise<void> }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="icon" variant="ghost" className="h-7 w-7"><Trash2 className="h-3.5 w-3.5" /></Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
