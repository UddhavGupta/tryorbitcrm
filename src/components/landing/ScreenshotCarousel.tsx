import { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Star, MapPin, Mail, Calendar, Bell, MoreHorizontal } from "lucide-react";

/**
 * 3-screen product tour. All screens are React mocks (no real screenshots)
 * so they stay crisp at any DPR and match the theme.
 */

const SCREENS = [
  { id: "people", label: "People view", title: "All the people in your orbit" },
  { id: "contact", label: "Contact detail", title: "Context that compounds over time" },
  { id: "reminders", label: "Reminders", title: "Surface the right person at the right time" },
];

export const ScreenshotCarousel = () => {
  const [idx, setIdx] = useState(0);
  const screen = SCREENS[idx];
  const next = () => setIdx((i) => (i + 1) % SCREENS.length);
  const prev = () => setIdx((i) => (i - 1 + SCREENS.length) % SCREENS.length);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          <p className="eyebrow-primary">{screen.label}</p>
          <h3 className="display-md mt-1">{screen.title}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prev}
            aria-label="Previous screen"
            className="h-9 w-9 rounded-full border border-border bg-card grid place-items-center hover:border-primary/40 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            aria-label="Next screen"
            className="h-9 w-9 rounded-full border border-border bg-card grid place-items-center hover:border-primary/40 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-lift">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/60">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <div className="ml-3 text-xs text-muted-foreground font-mono truncate">orbitcrm.guptau.com/{screen.id}</div>
        </div>
        <div className="p-5 md:p-7 min-h-[420px]">
          {screen.id === "people" && <PeopleScreen />}
          {screen.id === "contact" && <ContactScreen />}
          {screen.id === "reminders" && <RemindersScreen />}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-5">
        {SCREENS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIdx(i)}
            aria-label={`Go to ${s.label}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === idx ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const PEOPLE = [
  { name: "Maya Ellis", role: "Product Strategy · Aster Vale", tag: "investor", warmth: 92 },
  { name: "Noah Raman", role: "Founder · Copperline Studio", tag: "founder", warmth: 78 },
  { name: "Leah Morrison", role: "Investor · Harborpoint Ventures", tag: "investor", warmth: 64 },
  { name: "Devika Rao", role: "PM · Lumen Health", tag: "operator", warmth: 41 },
  { name: "Arjun Vale", role: "Chief of Staff · Northbridge", tag: "operator", warmth: 22 },
  { name: "Priya Mehta", role: "PM · Waypoint Cloud", tag: "alumni", warmth: 18 },
];

const PeopleScreen = () => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-2 flex-1 rounded-lg border border-border bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search 248 people…</span>
      </div>
      <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm">
        <Filter className="h-3.5 w-3.5" /> Filters · 2
      </button>
    </div>
    <div className="divide-y divide-border/60 rounded-xl border border-border bg-background/40">
      {PEOPLE.map((p) => (
        <div key={p.name} className="flex items-center gap-3 px-4 py-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
            {p.name.split(" ").map((s) => s[0]).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{p.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{p.role}</p>
          </div>
          <span className="pill pill-primary capitalize">{p.tag}</span>
          <div className="hidden sm:flex items-center gap-1.5 w-20">
            <div className="h-1 flex-1 rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${p.warmth}%`,
                  background: p.warmth > 60 ? "hsl(var(--success))" : p.warmth > 35 ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground num-tabular w-6 text-right">{p.warmth}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ContactScreen = () => (
  <div className="grid md:grid-cols-3 gap-5">
    <div className="md:col-span-1 space-y-3">
      <div className="h-16 w-16 rounded-full bg-primary/15 text-primary grid place-items-center text-xl font-semibold">ME</div>
      <div>
        <h4 className="font-display text-xl">Maya Ellis</h4>
        <p className="text-xs text-muted-foreground">Product Strategy · Aster Vale Labs</p>
      </div>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> maya@astervale.co</p>
        <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Brooklyn, NY</p>
        <p className="flex items-center gap-2"><Star className="h-3 w-3 text-primary" /> High priority</p>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-2">
        <span className="pill pill-primary">investor</span>
        <span className="pill pill-muted">warm intro</span>
        <span className="pill pill-muted">2024 cohort</span>
      </div>
    </div>
    <div className="md:col-span-2 space-y-3">
      <div className="rounded-xl border border-border bg-background/40 p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Recent timeline</p>
        <ul className="space-y-3 text-sm">
          {[
            { d: "May 12", t: "Replied to follow-up — wants intro to design team" },
            { d: "Apr 28", t: "Coffee chat at Devocion · 45 min" },
            { d: "Mar 04", t: "Connected via Sasha Park" },
          ].map((x) => (
            <li key={x.d} className="flex gap-3">
              <span className="text-[11px] text-muted-foreground num-tabular w-12 shrink-0 pt-0.5">{x.d}</span>
              <span className="text-foreground/80">{x.t}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-border bg-background/40 p-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Notes</p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Building out the design-led founder portfolio. Loves long-form product writing — send the Slack→Linear post.
        </p>
      </div>
    </div>
  </div>
);

const RemindersScreen = () => (
  <div className="space-y-4">
    {[
      { when: "Today", color: "primary", items: [
        { name: "Maya Ellis", action: "Share design team intro" },
        { name: "Noah Raman", action: "Send updated deck" },
      ]},
      { when: "This week", color: "muted", items: [
        { name: "Leah Morrison", action: "Confirm coffee Thursday" },
        { name: "Devika Rao", action: "Reply to Slack thread" },
        { name: "Sasha Park", action: "Wish happy birthday" },
      ]},
      { when: "Cooling soon", color: "warning", items: [
        { name: "Arjun Vale", action: "47 days since last touch" },
      ]},
    ].map((group) => (
      <div key={group.when}>
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{group.when}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/40 divide-y divide-border/60">
          {group.items.map((it) => (
            <div key={it.name} className="flex items-center gap-3 px-4 py-2.5">
              <div className="h-2 w-2 rounded-full bg-primary/60" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{it.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{it.action}</p>
              </div>
              <button className="text-[11px] text-primary font-medium">Mark done</button>
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
