import { useEffect, useRef, useState } from "react";
import { Sparkles, Check, Bell, Search, Mail, Calendar, MapPin, Plus, Users, Home, Star, Inbox } from "lucide-react";

/**
 * ProductFilm — ~16-second autoplaying choreographed UI demo for the landing.
 * Pure React + CSS animation driven by a single rAF loop normalized to time.
 * Loops indefinitely. Respects prefers-reduced-motion.
 *
 * Acts (16s total, fast & punchy):
 *  0.0 – 2.0s  Header + sidebar + list visible; cursor drifts to "Maya Chen"
 *  2.0 – 3.0s  Profile slides in with tags, timeline placeholder
 *  3.0 – 7.0s  AI brief streams in line by line (Gemini badge pulses)
 *  7.0 – 9.0s  Cursor to "Draft intro" chip → chip presses
 *  9.0 – 11.5s Reminder card slides in
 * 11.5 – 13.0s Cursor to checkbox → reminder checked off
 * 13.0 – 16.0s "Logged" badge + soft outro caption, then loop
 */

const DURATION = 16; // seconds
const FPS = 30;

const BRIEF_LINES = [
  { label: "How you know her", text: "Met at Figma Config '24. Now leads design at Linear." },
  { label: "Last interaction", text: "Coffee 6 weeks ago — talked about her sabbatical." },
  { label: "Worth remembering", text: "Daughter just started kindergarten." },
  { label: "Open thread", text: "You owe her an intro to Priya." },
  { label: "Suggested next", text: "Send intro this week, before her Tokyo trip." },
];

const CAPTIONS: Array<{ at: number; text: string }> = [
  { at: 0.2,  text: "A calm list of the people who matter." },
  { at: 2.2,  text: "Open anyone — context loads instantly." },
  { at: 3.4,  text: "Gemini drafts the brief from your own notes." },
  { at: 7.2,  text: "One tap turns it into a follow-up." },
  { at: 9.4,  text: "Reminders close the loop, gently." },
  { at: 13.2, text: "That's the whole loop — in fifteen seconds." },
];

// 920 x 575 design canvas
const CANVAS_W = 920;
const CANVAS_H = 575;

export const ProductFilm = () => {
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) { setT(DURATION * 0.4); return; }
    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = ((now - startRef.current) / 1000) % DURATION;
      setT(Math.floor(elapsed * FPS) / FPS);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [reduced]);

  const lerp = (a: number, b: number, x: number) => a + (b - a) * Math.max(0, Math.min(1, x));
  const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

  // Cursor keyframes (canvas coords). Snappier transitions.
  const cursor = (() => {
    // 0–1.6s: drift from top into the list row
    if (t < 1.6) {
      const p = ease(t / 1.6);
      return { x: lerp(360, 200, p), y: lerp(80, 220, p) };
    }
    // 1.6–7.0s: rest on list row
    if (t < 7.0) return { x: 200, y: 220 };
    // 7.0–8.4s: glide to "Draft intro" chip
    if (t < 8.4) {
      const p = ease((t - 7.0) / 1.4);
      return { x: lerp(200, 540, p), y: lerp(220, 388, p) };
    }
    // 8.4–11.6s: rest on chip
    if (t < 11.6) return { x: 540, y: 388 };
    // 11.6–12.8s: glide to checkbox
    if (t < 12.8) {
      const p = ease((t - 11.6) / 1.2);
      return { x: lerp(540, 360, p), y: lerp(388, 488, p) };
    }
    return { x: 360, y: 488 };
  })();

  const click = (start: number) => {
    const d = t - start;
    if (d < 0 || d > 0.35) return 0;
    return 1 - d / 0.35;
  };

  const profileOpen = t > 1.9;
  const profileP = ease((t - 1.9) / 0.5);

  const visibleBriefLines = Math.min(
    BRIEF_LINES.length,
    Math.max(0, Math.floor((t - 3.0) / 0.75)),
  );

  const chipPressed = t > 8.3 && t < 8.9;
  const reminderShown = t > 9.2;
  const reminderP = ease((t - 9.2) / 0.45);
  const reminderChecked = t > 12.75;
  const outroFade = t > 14.8 ? ease((t - 14.8) / 1.0) : 0;

  const activeCap = [...CAPTIONS].reverse().find((c) => t >= c.at);

  return (
    <div className="relative">
      <div
        className="relative mx-auto rounded-[20px] overflow-hidden border"
        style={{
          maxWidth: CANVAS_W,
          aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
          background: "hsl(var(--background))",
          borderColor: "hsl(var(--primary) / 0.12)",
          boxShadow: "0 30px 80px -40px hsl(var(--primary) / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.7)",
        }}
        role="img"
        aria-label="OrbitCRM product film — a 15-second walkthrough of opening a contact, generating an AI brief, and completing a reminder."
      >
        <div style={{ opacity: 1 - outroFade * 0.15, transition: "opacity 200ms" }} className="absolute inset-0">
          <FrameContent
            t={t}
            profileOpen={profileOpen}
            profileP={profileP}
            visibleBriefLines={visibleBriefLines}
            chipPressed={chipPressed}
            reminderShown={reminderShown}
            reminderP={reminderP}
            reminderChecked={reminderChecked}
          />
        </div>

        {/* Cursor */}
        {!reduced && (
          <div
            className="pointer-events-none absolute z-30"
            style={{
              left: `${(cursor.x / CANVAS_W) * 100}%`,
              top: `${(cursor.y / CANVAS_H) * 100}%`,
              transform: "translate(-2px, -2px)",
            }}
            aria-hidden
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 2 L17 11 L10 12 L13 19 L11 20 L8 13 L3 17 Z"
                fill="hsl(var(--primary-ink))" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            {[1.7, 8.5, 12.85].map((time) => {
              const o = click(time);
              if (o === 0) return null;
              return (
                <span key={time}
                  className="absolute rounded-full"
                  style={{
                    left: -10, top: -10,
                    width: 30 + 30 * (1 - o), height: 30 + 30 * (1 - o),
                    border: "2px solid hsl(var(--primary))",
                    opacity: o * 0.7,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Caption strip */}
        <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
          <div className="px-6 py-3 bg-gradient-to-t from-background/95 via-background/70 to-transparent">
            <div className="min-h-[26px]">
              {activeCap && (
                <p
                  key={activeCap.at}
                  className="font-display text-sm sm:text-base italic leading-snug animate-fade-in"
                  style={{ color: "hsl(var(--primary-ink))" }}
                >
                  {activeCap.text}
                </p>
              )}
            </div>
            <div className="mt-1.5 h-[2px] w-full bg-border/70 overflow-hidden rounded-full">
              <div
                className="h-full"
                style={{ width: `${(t / DURATION) * 100}%`, background: "hsl(var(--primary))" }}
              />
            </div>
          </div>
        </div>

        {reduced && (
          <p className="absolute top-3 right-3 z-30 text-[10px] uppercase tracking-wider text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Motion reduced
          </p>
        )}
      </div>
    </div>
  );
};

// ---------- Frame content ----------

const FrameContent = ({
  t, profileOpen, profileP, visibleBriefLines, chipPressed,
  reminderShown, reminderP, reminderChecked,
}: {
  t: number;
  profileOpen: boolean;
  profileP: number;
  visibleBriefLines: number;
  chipPressed: boolean;
  reminderShown: boolean;
  reminderP: number;
  reminderChecked: boolean;
}) => {
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Top app bar */}
      <div className="h-11 border-b border-border/60 flex items-center px-4 gap-3 bg-card/40 shrink-0">
        <div className="h-6 w-6 rounded-md grid place-items-center" style={{ background: "hsl(var(--primary-ink))" }}>
          <span className="font-display text-[11px]" style={{ color: "hsl(var(--background))" }}>O</span>
        </div>
        <span className="font-display text-[13px] italic" style={{ color: "hsl(var(--primary-ink))" }}>Orbit</span>
        <div className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/[0.04] border border-border/50 text-[11px] text-muted-foreground w-[260px]">
          <Search className="h-3 w-3" /> Search people, groups, notes…
          <span className="ml-auto text-[9px] px-1 py-0.5 rounded bg-foreground/10">⌘K</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Demo workspace</span>
          <div className="h-6 w-6 rounded-full bg-primary/15 grid place-items-center text-[10px] font-medium" style={{ color: "hsl(var(--primary-ink))" }}>U</div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar (with labels — matches real app) */}
        <div className="w-[148px] border-r border-border/60 py-3 px-2 shrink-0 bg-[hsl(var(--primary-soft)/0.18)]">
          {[
            { icon: Home, label: "Dashboard" },
            { icon: Users, label: "People", active: true },
            { icon: Star, label: "Groups" },
            { icon: Calendar, label: "Dates" },
            { icon: Bell, label: "Reminders" },
            { icon: Inbox, label: "Integrations" },
          ].map((it) => (
            <div
              key={it.label}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 text-[12px]"
              style={{
                background: it.active ? "hsl(var(--primary-soft) / 0.7)" : "transparent",
                color: it.active ? "hsl(var(--primary-ink))" : "hsl(var(--muted-foreground))",
                fontWeight: it.active ? 500 : 400,
              }}
            >
              <it.icon className="h-3.5 w-3.5" /> {it.label}
            </div>
          ))}
          <div className="mt-4 px-2 text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70">Groups</div>
          <div className="px-2 py-1 text-[11px] text-muted-foreground">Linear circle</div>
          <div className="px-2 py-1 text-[11px] text-muted-foreground">Investors</div>
          <div className="px-2 py-1 text-[11px] text-muted-foreground">Mentors</div>
        </div>

        {/* List column */}
        <div className="w-[244px] border-r border-border/60 shrink-0 flex flex-col">
          <div className="px-3 py-2.5 border-b border-border/60 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-medium" style={{ color: "hsl(var(--primary-ink))" }}>People</p>
              <p className="text-[10px] text-muted-foreground">142 · sorted by recent</p>
            </div>
            <button className="h-6 w-6 rounded-md grid place-items-center bg-primary/10 text-primary" aria-hidden>
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-hidden py-2 px-1.5">
            <SectionLabel>Cooling — reach out</SectionLabel>
            <ListRow active={t > 1.85} highlight={t > 1.4 && t < 2.2} name="Maya Chen" meta="Design lead · Linear" initials="MC" days="6w" />
            <ListRow name="Jordan Hayes" meta="Founder · Brookline" initials="JH" days="4w" />
            <ListRow name="Priya Raman" meta="VP Eng · Stripe" initials="PR" days="3w" />
            <SectionLabel>This week</SectionLabel>
            <ListRow name="Sam Okonkwo" meta="College friend · Boston" initials="SO" days="2d" />
            <ListRow name="Aaron Lee" meta="Ex-coworker · Notion" initials="AL" days="5d" />
            <ListRow name="Hana Park" meta="Mentor · independent" initials="HP" days="1w" />
          </div>
        </div>

        {/* Detail panel */}
        <div className="relative flex-1 overflow-hidden">
          {!profileOpen && (
            <div className="absolute inset-0 grid place-items-center text-center px-8">
              <div className="opacity-70">
                <p className="font-display text-xl italic" style={{ color: "hsl(var(--primary-ink))" }}>
                  Select someone to begin.
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">A brief appears on the right.</p>
              </div>
            </div>
          )}

          {profileOpen && (
            <div
              className="absolute inset-0 p-4 overflow-hidden"
              style={{ opacity: profileP, transform: `translateY(${(1 - profileP) * 8}px)` }}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full grid place-items-center font-display text-base"
                  style={{ background: "hsl(var(--primary-soft))", color: "hsl(var(--primary-ink))" }}>
                  MC
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[17px] leading-tight" style={{ color: "hsl(var(--primary-ink))" }}>Maya Chen</p>
                  <p className="text-[11px] text-muted-foreground">Design lead at Linear · met at Config '24</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Mail className="h-2.5 w-2.5" />maya@…</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />Brooklyn</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />Mar 14</span>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  Cooling · 6w
                </span>
              </div>

              {/* Tag row */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["design", "linear", "config-24", "intro-owed"].map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/[0.04] border border-border/60 text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* AI brief */}
              <div
                className="mt-3 rounded-xl border p-3.5"
                style={{
                  borderColor: "hsl(var(--primary) / 0.18)",
                  background: "hsl(var(--primary-soft) / 0.35)",
                }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <p className="text-[9px] uppercase tracking-[0.16em] text-primary font-semibold">Relationship brief</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">Gemini</span>
                  {t > 3.0 && visibleBriefLines < BRIEF_LINES.length && (
                    <span className="ml-auto inline-flex items-center gap-1.5 text-[9px] text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      drafting…
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-[12px]">
                  {BRIEF_LINES.slice(0, visibleBriefLines).map((l, i) => (
                    <div key={i} className="animate-fade-in" style={{ animationDuration: "260ms" }}>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground font-medium">{l.label}</p>
                      <p className="text-foreground/90 leading-snug">{l.text}</p>
                    </div>
                  ))}
                  {visibleBriefLines === 0 && (
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-2/3 rounded bg-foreground/10 animate-pulse" />
                      <div className="h-2.5 w-1/2 rounded bg-foreground/10 animate-pulse" />
                      <div className="h-2.5 w-3/5 rounded bg-foreground/10 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Action chips row — always present once brief done */}
                {visibleBriefLines >= BRIEF_LINES.length && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <button
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-transform"
                      style={{
                        background: "hsl(var(--primary-ink))",
                        color: "hsl(var(--background))",
                        transform: chipPressed ? "scale(0.96)" : "scale(1)",
                        boxShadow: "0 6px 18px -8px hsl(var(--primary) / 0.55)",
                      }}
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      Draft intro to Priya
                    </button>
                    <span className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground">+ Reminder</span>
                    <span className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground">Pre-meeting prep</span>
                  </div>
                )}
              </div>

              {/* Timeline preview */}
              <div className="mt-3 rounded-xl border border-border/60 p-3">
                <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-2">Recent timeline</p>
                <div className="space-y-1.5">
                  {reminderShown && (
                    <div
                      className="flex items-center gap-2.5 rounded-lg border p-2 -mx-1"
                      style={{
                        borderColor: "hsl(var(--primary) / 0.22)",
                        background: "hsl(var(--card))",
                        transform: `translateY(${(1 - reminderP) * 10}px)`,
                        opacity: reminderP,
                      }}
                    >
                      <div
                        className="h-4 w-4 rounded-full border grid place-items-center shrink-0 transition-colors"
                        style={{
                          borderColor: reminderChecked ? "hsl(var(--primary))" : "hsl(var(--border))",
                          background: reminderChecked ? "hsl(var(--primary))" : "transparent",
                        }}
                      >
                        {reminderChecked && <Check className="h-2.5 w-2.5" style={{ color: "hsl(var(--background))" }} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[12px] leading-tight"
                          style={{
                            textDecoration: reminderChecked ? "line-through" : "none",
                            color: reminderChecked ? "hsl(var(--muted-foreground))" : "inherit",
                          }}
                        >
                          Send intro to Priya
                        </p>
                        <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                          <Bell className="h-2.5 w-2.5" /> Due this week
                        </p>
                      </div>
                      {reminderChecked && (
                        <span className="text-[9px] uppercase tracking-wider text-primary font-medium animate-fade-in">Logged</span>
                      )}
                    </div>
                  )}
                  <TimelineItem label="Coffee · Brooklyn" when="6 weeks ago" />
                  <TimelineItem label="Email · Config recap" when="3 months ago" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/80 font-medium px-2 mt-1 mb-1">{children}</p>
);

const ListRow = ({ name, meta, initials, active, highlight, days }: {
  name: string; meta: string; initials: string; active?: boolean; highlight?: boolean; days?: string;
}) => (
  <div
    className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 transition-colors"
    style={{
      background: active
        ? "hsl(var(--primary-soft) / 0.7)"
        : highlight
        ? "hsl(var(--primary-soft) / 0.35)"
        : "transparent",
    }}
  >
    <div className="h-6 w-6 rounded-full grid place-items-center text-[9px] font-medium shrink-0"
      style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary-ink))" }}>
      {initials}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[12px] leading-tight truncate" style={{ color: active ? "hsl(var(--primary-ink))" : "inherit", fontWeight: active ? 500 : 400 }}>
        {name}
      </p>
      <p className="text-[10px] text-muted-foreground truncate">{meta}</p>
    </div>
    {days && <span className="text-[9px] text-muted-foreground/80 shrink-0">{days}</span>}
  </div>
);

const TimelineItem = ({ label, when }: { label: string; when: string }) => (
  <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
    <span className="text-foreground/80">{label}</span>
    <span className="ml-auto">{when}</span>
  </div>
);
