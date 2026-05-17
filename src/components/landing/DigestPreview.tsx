import { Inbox } from "lucide-react";

/** Mock of the (aspirational) Monday digest email. */
export const DigestPreview = () => (
  <div className="max-w-2xl mx-auto">
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lift">
      {/* Email chrome */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-background/60">
        <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-mono truncate">
          Monday · 7:00 AM · from <span className="text-foreground">orbit@guptau.com</span>
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-5">
        <div>
          <p className="eyebrow-primary">Your orbit this week</p>
          <h3 className="font-display text-2xl md:text-3xl mt-1.5 leading-tight">
            5 people worth a message.<br />
            <span className="text-muted-foreground">Here's where to start.</span>
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { tag: "Reach out", who: "Maya Ellis", note: "She asked for the design team intro 4 days ago." },
            { tag: "Reach out", who: "Noah Raman", note: "Said he'd send feedback on the deck this week." },
            { tag: "Birthday", who: "Sofia Park", note: "Today. A short note goes a long way." },
            { tag: "Cooling", who: "Arjun Vale", note: "47 days since you last spoke. Used to be weekly." },
            { tag: "Follow up", who: "Leah Morrison", note: "Coffee chat reply pending since Tuesday." },
          ].map((row) => (
            <div key={row.who} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-3">
              <span className="pill pill-primary shrink-0 mt-0.5">{row.tag}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{row.who}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{row.note}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground pt-2 border-t border-border/60">
          Sent automatically every Monday morning. Open the dashboard to act on any of these in one click.
        </p>
      </div>
    </div>
  </div>
);
