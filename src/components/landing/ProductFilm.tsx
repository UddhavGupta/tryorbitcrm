import { useEffect, useRef, useState } from "react";
import { Sparkles, Check, Bell, Mail, Calendar, MapPin } from "lucide-react";

/**
 * ProductFilm — 30-second autoplaying choreographed UI demo for the landing.
 * Pure React + CSS animation driven by a single rAF loop normalized to time.
 * No audio, no narration; caption beats appear at the bottom in sync with
 * each act. Loops indefinitely. Respects prefers-reduced-motion.
 *
 * Acts (~30s total):
 *  0.0 –  4.5s  Open on contact list, cursor drifts to "Maya Chen"
 *  4.5 –  9.0s  Contact opens, profile fades in
 *  9.0 – 17.0s  AI brief streams in line by line
 * 17.0 – 22.0s  Cursor moves to "Generate draft" — chip appears
 * 22.0 – 28.0s  Reminder card slides in, gets checked off
 * 28.0 – 30.0s  Soft outro — "That's the loop."
 */

const DURATION = 30; // seconds
const FPS = 30;

const BRIEF_LINES = [
  { label: "How you know her", text: "Met at Figma Config 2024. Now leads design at Linear." },
  { label: "Last interaction", text: "Coffee, 6 weeks ago — talked about her sabbatical plans." },
  { label: "Worth remembering", text: "Daughter just started kindergarten. Loves slow mornings." },
  { label: "Open thread", text: "You owe her an intro to Priya." },
  { label: "Suggested next", text: "Send the intro this week, before her Tokyo trip." },
];

const CAPTIONS: Array<{ at: number; text: string }> = [
  { at: 0.4,  text: "A quiet list of the people who matter." },
  { at: 5.2,  text: "Open anyone." },
  { at: 9.4,  text: "Orbit drafts the relationship brief from your own notes." },
  { at: 17.5, text: "One tap turns it into a follow-up." },
  { at: 22.5, text: "Reminders close the loop, gently." },
  { at: 28.2, text: "That's the whole loop." },
];

export const ProductFilm = () => {
  const [t, setT] = useState(0); // seconds, 0..DURATION
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
    if (reduced) { setT(DURATION * 0.5); return; }
    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = ((now - startRef.current) / 1000) % DURATION;
      // Snap to FPS grid for deterministic feel.
      setT(Math.floor(elapsed * FPS) / FPS);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [reduced]);

  // ----- act helpers -----
  const lerp = (a: number, b: number, x: number) => a + (b - a) * Math.max(0, Math.min(1, x));
  const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

  // Cursor path — 3 keyframes
  // Row "Maya Chen" target (in list panel coords ~ x:36, y:148)
  // Then to "Generate draft" chip (in brief panel ~ x:430, y:330)
  // Then to reminder check (~ x:610, y:478)
  const cursor = (() => {
    if (t < 4.2) {
      const p = ease(t / 4.2);
      return { x: lerp(120, 86, p), y: lerp(60, 148, p) };
    }
    if (t < 17.0) {
      return { x: 86, y: 148 };
    }
    if (t < 21.5) {
      const p = ease((t - 17.0) / 4.5);
      return { x: lerp(86, 430, p), y: lerp(148, 330, p) };
    }
    if (t < 27.0) {
      const p = ease((t - 22.5) / 4.5);
      return { x: lerp(430, 610, p), y: lerp(330, 478, p) };
    }
    return { x: 610, y: 478 };
  })();

  const click = (start: number) => {
    const d = t - start;
    if (d < 0 || d > 0.45) return 0;
    return 1 - d / 0.45;
  };

  const profileOpen = t > 4.4;
  const profileP = ease((t - 4.4) / 1.2);

  const visibleBriefLines = Math.min(
    BRIEF_LINES.length,
    Math.max(0, Math.floor((t - 9.0) / 1.4)),
  );

  const chipShown = t > 21.0;
  const chipP = ease((t - 21.0) / 0.5);

  const reminderShown = t > 22.5;
  const reminderP = ease((t - 22.5) / 0.6);
  const reminderChecked = t > 26.7;
  const reminderFade = t > 27.6 ? ease((t - 27.6) / 1.2) : 0;

  // Current caption
  const activeCap = [...CAPTIONS].reverse().find((c) => t >= c.at);

  return (
    <div className="relative">
      {/* Aspect-ratio canvas — keeps everything pixel-stable */}
      <div
        className="relative mx-auto rounded-[20px] overflow-hidden border"
        style={{
          maxWidth: 920,
          aspectRatio: "16 / 10",
          background: "hsl(var(--background))",
          borderColor: "hsl(var(--primary) / 0.12)",
          boxShadow: "0 30px 80px -40px hsl(var(--primary) / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.7)",
        }}
        role="img"
        aria-label="OrbitCRM product film — a 30-second animated walkthrough of opening a contact, generating an AI brief, and completing a reminder."
      >
        <FrameContent
          t={t}
          profileOpen={profileOpen}
          profileP={profileP}
          visibleBriefLines={visibleBriefLines}
          chipShown={chipShown}
          chipP={chipP}
          reminderShown={reminderShown}
          reminderP={reminderP}
          reminderChecked={reminderChecked}
          reminderFade={reminderFade}
        />

        {/* Cursor */}
        {!reduced && (
          <div
            className="pointer-events-none absolute z-30 transition-none"
            style={{ left: `${(cursor.x / 920) * 100}%`, top: `${(cursor.y / 575) * 100}%`, transform: "translate(-2px, -2px)" }}
            aria-hidden
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 2 L17 11 L10 12 L13 19 L11 20 L8 13 L3 17 Z"
                fill="hsl(var(--primary-ink))" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            {/* Click ripples */}
            {[5.0, 21.6, 26.7].map((time) => {
              const o = click(time);
              if (o === 0) return null;
              return (
                <span key={time}
                  className="absolute rounded-full"
                  style={{
                    left: -10, top: -10, width: 30 + 30 * (1 - o), height: 30 + 30 * (1 - o),
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
          <div className="px-6 py-4 bg-gradient-to-t from-background/95 via-background/70 to-transparent">
            <div className="min-h-[28px]">
              {activeCap && (
                <p
                  key={activeCap.at}
                  className="font-display text-base sm:text-lg italic leading-snug animate-fade-in"
                  style={{ color: "hsl(var(--primary-ink))" }}
                >
                  {activeCap.text}
                </p>
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-[2px] w-full bg-border/70 overflow-hidden rounded-full">
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
  t, profileOpen, profileP, visibleBriefLines, chipShown, chipP,
  reminderShown, reminderP, reminderChecked, reminderFade,
}: {
  t: number;
  profileOpen: boolean;
  profileP: number;
  visibleBriefLines: number;
  chipShown: boolean;
  chipP: number;
  reminderShown: boolean;
  reminderP: number;
  reminderChecked: boolean;
  reminderFade: number;
}) => {
  return (
    <div className="absolute inset-0 flex">
      {/* Sidebar (decorative) */}
      <div className="hidden sm:flex w-[64px] flex-col items-center gap-3 py-4 border-r border-border/60 bg-[hsl(var(--primary-soft)/0.25)]">
        <div className="h-8 w-8 rounded-lg grid place-items-center" style={{ background: "hsl(var(--primary-ink))" }}>
          <span className="font-display text-cream text-sm" style={{ color: "hsl(var(--background))" }}>O</span>
        </div>
        <div className="mt-2 w-8 h-8 rounded-md bg-primary/15" />
        <div className="w-8 h-8 rounded-md bg-foreground/5" />
        <div className="w-8 h-8 rounded-md bg-foreground/5" />
        <div className="w-8 h-8 rounded-md bg-foreground/5" />
      </div>

      {/* List column */}
      <div className="w-[260px] border-r border-border/60 py-4 px-3 shrink-0">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-3 px-2">People · 142</p>
        <ListRow active={t > 4.4} highlight={t > 3.6 && t < 5.2} name="Maya Chen" meta="Design lead · Linear" initials="MC" />
        <ListRow name="Jordan Hayes" meta="Founder · Brookline Ventures" initials="JH" />
        <ListRow name="Priya Raman" meta="VP Eng · Stripe" initials="PR" />
        <ListRow name="Sam Okonkwo" meta="College friend · Boston" initials="SO" />
        <ListRow name="Aaron Lee" meta="Ex-coworker · Notion" initials="AL" />
        <ListRow name="Hana Park" meta="Mentor · independent" initials="HP" />
      </div>

      {/* Detail / brief panel */}
      <div className="relative flex-1 overflow-hidden">
        {/* Empty state pre-open */}
        {!profileOpen && (
          <div className="absolute inset-0 grid place-items-center text-center px-8">
            <div className="opacity-70">
              <p className="font-display text-2xl italic" style={{ color: "hsl(var(--primary-ink))" }}>
                Select someone to begin.
              </p>
              <p className="text-xs text-muted-foreground mt-2">A brief appears on the right.</p>
            </div>
          </div>
        )}

        {/* Profile + brief */}
        {profileOpen && (
          <div
            className="absolute inset-0 p-5 overflow-hidden"
            style={{ opacity: profileP, transform: `translateY(${(1 - profileP) * 8}px)` }}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full grid place-items-center font-display text-lg"
                style={{ background: "hsl(var(--primary-soft))", color: "hsl(var(--primary-ink))" }}>
                MC
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl leading-tight" style={{ color: "hsl(var(--primary-ink))" }}>Maya Chen</p>
                <p className="text-xs text-muted-foreground">Design lead at Linear · met at Config '24</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />maya@…</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />Brooklyn</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Birthday Mar 14</span>
                </div>
              </div>
            </div>

            {/* Brief card */}
            <div
              className="mt-4 rounded-xl border p-4"
              style={{
                borderColor: "hsl(var(--primary) / 0.18)",
                background: "hsl(var(--primary-soft) / 0.35)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary font-semibold">AI relationship brief</p>
                {t > 9.0 && visibleBriefLines < BRIEF_LINES.length && (
                  <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    drafting…
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-sm">
                {BRIEF_LINES.slice(0, visibleBriefLines).map((l, i) => (
                  <div
                    key={i}
                    className="animate-fade-in"
                    style={{ animationDuration: "320ms" }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">{l.label}</p>
                    <p className="text-foreground/90 leading-snug">{l.text}</p>
                  </div>
                ))}
                {visibleBriefLines === 0 && (
                  <div className="space-y-2">
                    <div className="h-3 w-2/3 rounded bg-foreground/10 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-foreground/10 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Action chip */}
              {chipShown && (
                <div
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: "hsl(var(--primary-ink))",
                    color: "hsl(var(--background))",
                    transform: `translateY(${(1 - chipP) * 6}px)`,
                    opacity: chipP,
                    boxShadow: "0 6px 18px -8px hsl(var(--primary) / 0.55)",
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  Draft intro to Priya
                </div>
              )}
            </div>

            {/* Reminder card slides in */}
            {reminderShown && (
              <div
                className="mt-4 rounded-xl border bg-card p-3 flex items-center gap-3"
                style={{
                  borderColor: "hsl(var(--primary) / 0.18)",
                  transform: `translateY(${(1 - reminderP) * 14}px)`,
                  opacity: (1 - reminderFade) * reminderP,
                }}
              >
                <button
                  className="h-5 w-5 rounded-full border grid place-items-center shrink-0"
                  style={{
                    borderColor: reminderChecked ? "hsl(var(--primary))" : "hsl(var(--border))",
                    background: reminderChecked ? "hsl(var(--primary))" : "transparent",
                  }}
                  aria-hidden
                >
                  {reminderChecked && <Check className="h-3 w-3" style={{ color: "hsl(var(--background))" }} />}
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm leading-tight"
                    style={{ textDecoration: reminderChecked ? "line-through" : "none", color: reminderChecked ? "hsl(var(--muted-foreground))" : "inherit" }}
                  >
                    Send intro to Priya
                  </p>
                  <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Bell className="h-3 w-3" /> Due this week
                  </p>
                </div>
                {reminderChecked && (
                  <span className="text-[10px] uppercase tracking-wider text-primary font-medium animate-fade-in">Logged</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ListRow = ({ name, meta, initials, active, highlight }: {
  name: string; meta: string; initials: string; active?: boolean; highlight?: boolean;
}) => (
  <div
    className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5"
    style={{
      background: active
        ? "hsl(var(--primary-soft) / 0.7)"
        : highlight
        ? "hsl(var(--primary-soft) / 0.35)"
        : "transparent",
    }}
  >
    <div className="h-7 w-7 rounded-full grid place-items-center text-[10px] font-medium"
      style={{ background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary-ink))" }}>
      {initials}
    </div>
    <div className="min-w-0">
      <p className="text-[13px] leading-tight truncate" style={{ color: active ? "hsl(var(--primary-ink))" : "inherit", fontWeight: active ? 500 : 400 }}>
        {name}
      </p>
      <p className="text-[10px] text-muted-foreground truncate">{meta}</p>
    </div>
  </div>
);
