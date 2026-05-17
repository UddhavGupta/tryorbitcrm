import { Sun, Cake, Flame, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * Live-feeling dashboard mock for the landing hero.
 *
 * It runs a small 4-step loop that cycles through realistic state changes
 * (a reach-out sliding in, a birthday being marked sent, a cooling counter
 * ticking up). The loop pauses when the component is offscreen and respects
 * `prefers-reduced-motion` (handled by useInView).
 */

type Reachout = { name: string; ctx: string; tag: string; priority: "high" | "med" | "low" };

const BASE_REACHOUTS: Reachout[] = [
  { name: "Maya Ellis", ctx: "Product Strategy · Aster Vale Labs", tag: "Follow up on referral", priority: "high" },
  { name: "Noah Raman", ctx: "Founder · Copperline Studio", tag: "Send updated deck", priority: "high" },
  { name: "Leah Morrison", ctx: "Investor · Harborpoint Ventures", tag: "Coffee chat reply", priority: "med" },
];
const EXTRA_REACHOUT: Reachout = {
  name: "Devika Rao",
  ctx: "PM · Lumen Health",
  tag: "Intro to design team",
  priority: "high",
};

const priorityDot: Record<"high" | "med" | "low", string> = {
  high: "bg-primary",
  med: "bg-amber-500",
  low: "bg-muted-foreground/40",
};

export const AnimatedDashboard = () => {
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 2800);
    return () => clearInterval(id);
  }, [inView]);

  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

  // Step-driven state
  const extraVisible = step >= 1;
  const birthdaySent = step >= 2;
  const coolingDays = 47 + (step >= 3 ? 1 : 0);
  const coolingPulse = step === 3;

  const reachouts = extraVisible ? [EXTRA_REACHOUT, ...BASE_REACHOUTS] : BASE_REACHOUTS;
  const reachCount = reachouts.length;

  return (
    <div ref={ref} className="relative max-w-5xl mx-auto">
      {/* Halo */}
      <div
        aria-hidden
        className="absolute -inset-x-12 -inset-y-16 -z-10 opacity-70 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, hsl(var(--primary) / 0.18), transparent 70%)",
        }}
      />
      <div className="rounded-2xl border border-border bg-card shadow-[0_30px_60px_-30px_hsl(24_30%_12%/0.35),0_2px_8px_-2px_hsl(24_30%_12%/0.08)] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/60">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <div className="ml-3 text-xs text-muted-foreground font-mono truncate">orbitcrm.guptau.com</div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            live
          </div>
        </div>

        <div className="p-5 md:p-7">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</p>
              <h3 className="font-display text-xl md:text-2xl mt-0.5">{greeting}, Uddhav</h3>
            </div>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Panel icon={<Sun className="h-3.5 w-3.5" />} title="Today's reach-outs" count={reachCount}>
              {reachouts.map((t, i) => (
                <li
                  key={t.name}
                  className={`flex items-start gap-2.5 py-2 border-b border-border/60 last:border-0 transition-all duration-500 ${
                    extraVisible && i === 0 ? "animate-[slide-in_0.5s_ease-out]" : ""
                  }`}
                  style={extraVisible && i === 0 ? { animation: "slide-in 0.5s cubic-bezier(0.22,1,0.36,1)" } : undefined}
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${priorityDot[t.priority]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{t.ctx}</p>
                    <p className="text-[11px] text-foreground/70 mt-0.5 truncate">{t.tag}</p>
                  </div>
                </li>
              ))}
            </Panel>

            <Panel icon={<Cake className="h-3.5 w-3.5" />} title="Birthdays" count={2}>
              <li className="flex items-center justify-between py-2 border-b border-border/60">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">Sofia Park</p>
                  <p className="text-[11px] text-muted-foreground truncate">UX Researcher</p>
                </div>
                <span
                  className={`text-[11px] font-medium shrink-0 ml-2 inline-flex items-center gap-1 transition-all duration-500 ${
                    birthdaySent ? "text-success" : "text-primary"
                  }`}
                >
                  {birthdaySent ? (
                    <>
                      <Check className="h-3 w-3" /> sent
                    </>
                  ) : (
                    "Today"
                  )}
                </span>
              </li>
              <li className="flex items-center justify-between py-2 border-b border-border/60">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">Ethan Brooks</p>
                  <p className="text-[11px] text-muted-foreground truncate">Growth Manager</p>
                </div>
                <span className="text-[11px] text-primary font-medium shrink-0 ml-2">in 3 days</span>
              </li>
              <li className="pt-2 text-[11px] text-muted-foreground">+2 more this month</li>
            </Panel>

            <Panel icon={<Flame className="h-3.5 w-3.5" />} title="Cooling alerts" count={2}>
              <li className="flex items-center justify-between py-2 border-b border-border/60">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">Arjun Vale</p>
                  <p className="text-[11px] text-muted-foreground truncate">Chief of Staff · Northbridge Systems</p>
                </div>
                <span
                  className={`text-[11px] shrink-0 ml-2 num-tabular transition-colors duration-500 ${
                    coolingPulse ? "text-destructive font-medium" : "text-muted-foreground"
                  }`}
                >
                  {coolingDays}d cold
                </span>
              </li>
              <li className="flex items-center justify-between py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">Priya Mehta</p>
                  <p className="text-[11px] text-muted-foreground truncate">PM · Waypoint Cloud</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 ml-2 num-tabular">62d cold</span>
              </li>
            </Panel>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div
        aria-hidden
        className="absolute inset-x-8 -bottom-6 h-10 -z-10 blur-2xl opacity-40"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, hsl(var(--foreground) / 0.25), transparent 80%)",
        }}
      />

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const Panel = ({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-background/40 p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium num-tabular tabular-nums transition-all duration-300">
        {count}
      </span>
    </div>
    <ul>{children}</ul>
  </div>
);
