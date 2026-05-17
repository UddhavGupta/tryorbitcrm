import { Quote } from "lucide-react";

/**
 * Honest "scenario" testimonials — labelled clearly as portfolio scenarios,
 * not real quotes. Keeps trust without misrepresenting.
 */
const QUOTES = [
  {
    quote:
      "I used the demo flow as a job-search dashboard for two weeks. The cooling alerts caught three recruiters I'd dropped without realizing.",
    persona: "Job seeker scenario · MBA '26",
  },
  {
    quote:
      "Replaced my messy fundraising spreadsheet. Knowing who I hadn't pinged in 30+ days changed how I closed the round.",
    persona: "Founder scenario · pre-seed",
  },
  {
    quote:
      "The birthday surface alone is worth it. Showed up for 4 friends I would've otherwise missed this month.",
    persona: "Student scenario · senior year",
  },
];

export const Testimonials = () => (
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-10">
      <p className="eyebrow-primary">What it feels like to use</p>
      <h2 className="display-lg mt-3">Quiet wins, week after week.</h2>
      <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto">
        Mock data. Product currently being tested.
      </p>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      {QUOTES.map((q) => (
        <figure key={q.persona} className="surface-card p-6 h-full flex flex-col">
          <Quote className="h-5 w-5 text-primary/40" />
          <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground/85 flex-1">
            "{q.quote}"
          </blockquote>
          <figcaption className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border/60">
            {q.persona}
          </figcaption>
        </figure>
      ))}
    </div>
  </div>
);
