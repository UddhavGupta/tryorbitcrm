import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type Step = {
  target?: string; // data-tour attribute value; omit for centered modal
  title: string;
  body: ReactNode;
  cta?: ReactNode; // extra action shown above default buttons
};

const STEPS: Step[] = [
  {
    title: "Welcome to OrbitCRM 👋",
    body: "A 30-second tour to show you the four corners of your relationship system.",
  },
  {
    target: "people",
    title: "People — your orbit",
    body: "Every contact lives here, with last-touch timing, priority, and follow-up dates. Add anyone you want to keep in touch with.",
  },
  {
    target: "reminders",
    title: "Reminders — never drop the ball",
    body: "Set follow-ups tied to a person. Overdue and due-today reminders surface on your dashboard.",
  },
  {
    target: "dates",
    title: "Dates — birthdays & anniversaries",
    body: "OrbitCRM tracks birthdays and key anniversaries so you can reach out at the right moment.",
  },
  {
    title: "You're set",
    body: "Want to play with realistic data first? Load a sample orbit — or jump straight in.",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

type TourCtx = {
  start: () => void;
  active: boolean;
};

const Ctx = createContext<TourCtx>({ start: () => {}, active: false });
export const useTour = () => useContext(Ctx);

type ProviderProps = {
  children: ReactNode;
  shouldAutoStart: boolean;
  onComplete: () => void;
  onLoadSample: () => void | Promise<void>;
};

export const TourProvider = ({ children, shouldAutoStart, onComplete, onLoadSample }: ProviderProps) => {
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [seeding, setSeeding] = useState(false);

  const start = useCallback(() => {
    setIdx(0);
    setActive(true);
  }, []);

  // Auto-start once
  useEffect(() => {
    if (shouldAutoStart) start();
  }, [shouldAutoStart, start]);

  const finish = useCallback(() => {
    setActive(false);
    onComplete();
  }, [onComplete]);

  const step = STEPS[idx];

  // Measure target
  useLayoutEffect(() => {
    if (!active || !step?.target) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`).forEach((el) => ro.observe(el));
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, idx, step]);

  // Esc to skip
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, STEPS.length - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  return (
    <Ctx.Provider value={{ start, active }}>
      {children}
      {active && createPortal(
        <TourOverlay
          step={step}
          stepIndex={idx}
          totalSteps={STEPS.length}
          rect={rect}
          seeding={seeding}
          onSkip={finish}
          onPrev={() => setIdx((i) => Math.max(i - 1, 0))}
          onNext={() => setIdx((i) => Math.min(i + 1, STEPS.length - 1))}
          onDone={finish}
          onLoadSample={async () => {
            setSeeding(true);
            try { await onLoadSample(); } finally { setSeeding(false); finish(); }
          }}
        />,
        document.body,
      )}
    </Ctx.Provider>
  );
};

type OverlayProps = {
  step: Step;
  stepIndex: number;
  totalSteps: number;
  rect: Rect | null;
  seeding: boolean;
  onSkip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDone: () => void;
  onLoadSample: () => void;
};

const PADDING = 8;

const TourOverlay = ({ step, stepIndex, totalSteps, rect, seeding, onSkip, onPrev, onNext, onDone, onLoadSample }: OverlayProps) => {
  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  // Position card near rect, or center
  const card = (() => {
    if (!rect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } as const;
    }
    const below = rect.top + rect.height + 16;
    const spaceBelow = window.innerHeight - below;
    const placeBelow = spaceBelow > 220;
    if (placeBelow) {
      return { top: `${below}px`, left: `${Math.max(16, Math.min(window.innerWidth - 360 - 16, rect.left))}px` } as const;
    }
    const above = rect.top - 16;
    return { top: `${above}px`, left: `${Math.max(16, Math.min(window.innerWidth - 360 - 16, rect.left))}px`, transform: "translateY(-100%)" } as const;
  })();

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Onboarding tour">
      {/* Backdrop with spotlight cutout via SVG mask */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - PADDING}
                y={rect.top - PADDING}
                width={rect.width + PADDING * 2}
                height={rect.height + PADDING * 2}
                rx={12}
                ry={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="hsl(var(--foreground) / 0.55)" mask="url(#tour-mask)" />
      </svg>

      {rect && (
        <div
          className="absolute pointer-events-none rounded-xl ring-2 ring-primary/80 shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]"
          style={{
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
          }}
        />
      )}

      <div
        className="absolute w-[min(360px,calc(100vw-32px))] surface-card p-5 shadow-[var(--shadow-elevated)] animate-in fade-in zoom-in-95 duration-200"
        style={card}
      >
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground rounded-md p-1"
          aria-label="Skip tour"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h3 className="text-base font-semibold pr-6">{step.title}</h3>
        <div className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{step.body}</div>

        <div className="flex items-center gap-1 mt-4">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === stepIndex ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={onPrev}>Back</Button>
            )}
            {isLast ? (
              <>
                <Button variant="outline" size="sm" onClick={onLoadSample} disabled={seeding}>
                  {seeding ? "Loading…" : "Load sample"}
                </Button>
                <Button size="sm" className="gradient-primary" onClick={onDone}>Start fresh</Button>
              </>
            ) : (
              <Button size="sm" className="gradient-primary" onClick={onNext}>Next</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
