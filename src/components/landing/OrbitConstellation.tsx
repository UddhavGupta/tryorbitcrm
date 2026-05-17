import { useEffect, useState } from "react";

/**
 * OrbitConstellation — branded hero visual.
 * A you-in-the-center diagram with three rotating orbit rings of "contact"
 * dots. One contact (Maya) pulses with a callout: she's overdue for a note.
 *
 * Pure CSS animations (no JS RAF loop) — respects prefers-reduced-motion.
 */

type Contact = {
  id: string;
  initials: string;
  ring: 0 | 1 | 2;
  /** angle in degrees on the ring, 0 = right, 90 = bottom */
  angle: number;
  tone?: "default" | "muted" | "warm";
};

const CONTACTS: Contact[] = [
  // Inner ring — closest, warmest
  { id: "ma", initials: "MA", ring: 0, angle: 312, tone: "warm" }, // Maya — featured
  { id: "jl", initials: "JL", ring: 0, angle: 70 },
  { id: "rs", initials: "RS", ring: 0, angle: 190 },

  // Middle ring
  { id: "pk", initials: "PK", ring: 1, angle: 25 },
  { id: "an", initials: "AN", ring: 1, angle: 110 },
  { id: "tc", initials: "TC", ring: 1, angle: 200, tone: "muted" },
  { id: "ev", initials: "EV", ring: 1, angle: 290 },

  // Outer ring — looser orbit
  { id: "ha", initials: "HA", ring: 2, angle: 15, tone: "muted" },
  { id: "ds", initials: "DS", ring: 2, angle: 75 },
  { id: "mo", initials: "MO", ring: 2, angle: 150 },
  { id: "kn", initials: "KN", ring: 2, angle: 220, tone: "muted" },
  { id: "sb", initials: "SB", ring: 2, angle: 300 },
];

// Ring geometry (in % of the 600x600 viewBox space).
const RINGS = [
  { radius: 110, duration: 38, direction: 1 },
  { radius: 185, duration: 56, direction: -1 },
  { radius: 260, duration: 78, direction: 1 },
];

const CENTER = 300;

export const OrbitConstellation = () => {
  // Animate the callout in after mount so it doesn't snap on first paint.
  const [showCallout, setShowCallout] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowCallout(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-3xl aspect-square">
      {/* Soft aurora wash behind the orbits */}
      <div
        aria-hidden
        className="absolute inset-[10%] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.22), transparent 65%)",
        }}
      />

      <svg
        viewBox="0 0 600 600"
        className="relative h-full w-full"
        role="img"
        aria-label="Your network orbiting around you, with Maya highlighted as overdue for a follow-up"
      >
        <defs>
          <radialGradient id="orb-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
            <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb-warm" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Orbit rings — faint guides */}
        {RINGS.map((r, i) => (
          <circle
            key={i}
            cx={CENTER}
            cy={CENTER}
            r={r.radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeDasharray="2 6"
            className="opacity-60"
          />
        ))}

        {/* Center: you */}
        <g>
          <circle cx={CENTER} cy={CENTER} r={70} fill="url(#orb-core)" />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={26}
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
          />
          <text
            x={CENTER}
            y={CENTER + 5}
            textAnchor="middle"
            className="fill-primary"
            style={{
              fontFamily: "var(--font-display, ui-serif, Georgia, serif)",
              fontSize: 18,
              fontStyle: "italic",
              fontWeight: 500,
            }}
          >
            you
          </text>
        </g>

        {/* Rings of contacts. Each ring rotates as a group; each dot
            counter-rotates to keep initials upright. */}
        {RINGS.map((ring, ringIdx) => (
          <g
            key={ringIdx}
            className="orbit-ring"
            style={{
              transformOrigin: `${CENTER}px ${CENTER}px`,
              animation: `orbit-spin ${ring.duration}s linear infinite`,
              animationDirection: ring.direction === 1 ? "normal" : "reverse",
            }}
          >
            {CONTACTS.filter((c) => c.ring === ringIdx).map((c) => {
              const rad = (c.angle * Math.PI) / 180;
              const x = CENTER + ring.radius * Math.cos(rad);
              const y = CENTER + ring.radius * Math.sin(rad);
              const featured = c.tone === "warm";
              const muted = c.tone === "muted";
              return (
                <g
                  key={c.id}
                  style={{
                    transformOrigin: `${x}px ${y}px`,
                    animation: `orbit-counter ${ring.duration}s linear infinite`,
                    animationDirection:
                      ring.direction === 1 ? "reverse" : "normal",
                  }}
                >
                  {featured && (
                    <>
                      <circle cx={x} cy={y} r={36} fill="url(#orb-warm)" />
                      <circle
                        cx={x}
                        cy={y}
                        r={20}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeOpacity={0.6}
                        strokeWidth={1.5}
                        className="orbit-pulse"
                      />
                    </>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={featured ? 18 : 15}
                    fill={
                      featured
                        ? "hsl(var(--primary))"
                        : "hsl(var(--card))"
                    }
                    stroke={
                      featured
                        ? "hsl(var(--primary))"
                        : "hsl(var(--border))"
                    }
                    strokeWidth={1.25}
                    className={muted ? "opacity-60" : ""}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    style={{
                      fontFamily:
                        "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      fill: featured
                        ? "hsl(var(--primary-foreground))"
                        : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {c.initials}
                  </text>
                  {featured && (
                    <CalloutAnchor x={x} y={y} visible={showCallout} />
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>

      <style>{`
        @keyframes orbit-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-counter {
          to { transform: rotate(-360deg); }
        }
        @keyframes orbit-pulse {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.35); opacity: 0; }
        }
        .orbit-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: orbit-pulse 2.6s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .orbit-ring { animation: none !important; }
          .orbit-ring > g { animation: none !important; }
          .orbit-pulse { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

/**
 * SVG anchor that escapes the rotating SVG so the callout card lives in HTML
 * and gets crisp typography + shadows. We use foreignObject for the card body.
 */
const CalloutAnchor = ({
  x,
  y,
  visible,
}: {
  x: number;
  y: number;
  visible: boolean;
}) => {
  // Line from the dot up-and-right into the callout.
  const tx = x + 70;
  const ty = y - 70;
  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 600ms ease-out",
      }}
    >
      <line
        x1={x}
        y1={y}
        x2={tx}
        y2={ty}
        stroke="hsl(var(--primary))"
        strokeOpacity={0.5}
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <foreignObject x={tx - 4} y={ty - 46} width={210} height={64}>
        <div
          className="rounded-xl border border-border bg-card/95 px-3 py-2 shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.35)] backdrop-blur"
          style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
        >
          <p className="text-[11px] font-semibold tracking-tight text-foreground">
            Maya Chen
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
            14 days since last note ·{" "}
            <span className="text-primary font-medium">say hi?</span>
          </p>
        </div>
      </foreignObject>
    </g>
  );
};
