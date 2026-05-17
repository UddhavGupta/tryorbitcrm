import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Is it really free?",
    a: "Yes. This is a portfolio project, so it's free to use. No credit card, no upsell.",
  },
  {
    q: "Can I import my existing contacts?",
    a: "Yes — there's a CSV import tool. Map your columns once and you're set. Most spreadsheets and exports from LinkedIn, Google Contacts, or Notion work.",
  },
  {
    q: "Does it sync with LinkedIn or my calendar?",
    a: "Not today. The product is intentionally opinionated about being a private notebook for your relationships, not another integration surface. Import is one-shot.",
  },
  {
    q: "Why not just use a spreadsheet?",
    a: "Spreadsheets don't remind you. OrbitCRM's whole job is to surface the right person at the right time — birthdays today, follow-ups this week, relationships drifting cold. A spreadsheet can store that data; only software can resurface it.",
  },
];

export const Faq = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <p className="eyebrow-primary">Frequently asked</p>
        <h2 className="display-lg mt-3">The honest answers.</h2>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {ITEMS.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={it.q} className={i > 0 ? "border-t border-border" : ""}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-card-muted/50 transition"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-foreground">{it.q}</span>
                <span className="h-7 w-7 rounded-full border border-border grid place-items-center shrink-0 text-muted-foreground">
                  {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{it.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
