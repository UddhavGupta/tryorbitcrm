import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["/"], label: "Focus search (on People)" },
  { keys: ["n"], label: "New contact" },
  { keys: ["r"], label: "New reminder" },
  { keys: ["g", "d"], label: "Go to Dashboard" },
  { keys: ["g", "p"], label: "Go to People" },
  { keys: ["g", "r"], label: "Go to Reminders" },
  { keys: ["g", "g"], label: "Go to Groups" },
  { keys: ["g", "t"], label: "Go to Dates" },
  { keys: ["?"], label: "Show this help" },
];

export const HotkeysHelp = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>Move faster around your orbit.</DialogDescription>
      </DialogHeader>
      <ul className="divide-y divide-border">
        {SHORTCUTS.map((s) => (
          <li key={s.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">{s.label}</span>
            <span className="flex items-center gap-1">
              {s.keys.map((k, i) => (
                <kbd
                  key={i}
                  className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5 rounded-md border border-border bg-secondary text-xs font-medium text-foreground"
                >
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </DialogContent>
  </Dialog>
);
