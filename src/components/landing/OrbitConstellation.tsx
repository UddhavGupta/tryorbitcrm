import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * OrbitConstellation — branded hero visual.
 * A you-in-the-center diagram with three rotating orbit rings of contact
 * dots. The "featured" contact rotates every few seconds — pulsing in primary
 * with a callout describing why they need attention.
 *
 * Pure CSS animations for the orbits (no JS RAF loop) — respects
 * prefers-reduced-motion.
 */

type Contact = {
  id: string;
  initials: string;
  name: string;
  ring: 0 | 1 | 2;
  /** angle in degrees on the ring, 0 = right, 90 = bottom */
  angle: number;
  /** short reason that appears in the callout when this contact is featured */
  reason: string;
  dim?: boolean;
};

const CONTACTS: Contact[] = [
  // Inner ring — closest
  { id: "ma", initials: "MA", name: "Maya Chen", ring: 0, angle: 312, reason: "14 days since last note · say hi?" },
  { id: "jl", initials: "JL", name: "Jordan Lee", ring: 0, angle: 70, reason: "Birthday next Tuesday 🎂" },
  { id: "rs", initials: "RS", name: "Rohan Shah", ring: 0, angle: 190, reason: "Promised an intro 3 weeks ago" },

  // Middle ring
  { id: "pk", initials: "PK", name: "Priya Kapoor", ring: 1, angle: 25, reason: "Started a new role at Figma" },
  { id: "an", initials: "AN", name: "Ana Navarro", ring: 1, angle: 110, reason: "Coffee chat overdue · 6 weeks" },
  { id: "tc", initials: "TC", name: "Tomás Cruz", ring: 1, angle: 200, reason: "Mentioned hiring — follow up", dim: true },
  { id: "ev", initials: "EV", name: "Elena Voss", ring: 1, angle: 290, reason: "Cooling off — last spoke Aug 12" },

  // Outer ring — looser orbit
  { id: "ha", initials: "HA", name: "Hana Abe", ring: 2, angle: 15, reason: "Sent a deck — circle back", dim: true },
  { id: "ds", initials: "DS", name: "Devon Sato", ring: 2, angle: 75, reason: "Anniversary at Stripe today" },
  { id: "mo", initials: "MO", name: "Maya Okonkwo", ring: 2, angle: 150, reason: "Mentor — quarterly check-in" },
  { id: "kn", initials: "KN", name: "Kenji Noma", ring: 2, angle: 220, reason: "Asked about Lagos trip", dim: true },
  { id: "sb", initials: "SB", name: "Sara Bennett", ring: 2, angle: 300, reason: "Investor intro pending" },
];

// Which contacts cycle through the "featured" spotlight. Pick a varied set
// across all three rings so the callout moves around the diagram.
const FEATURED_ORDER = ["ma", "an", "ds", "jl", "ev", "mo", "rs", "pk", "sb"];
const ROTATE_MS = 3200;
const FADE_MS = 380;

// Ring geometry (relative to the 600x600 viewBox).
const RINGS = [
  { radius: 110, duration: 38, direction: 1 },
  { radius: 185, duration: 56, direction: -1 },
  { radius: 260, duration: 78, direction: 1 },
];

const CENTER = 300;

export const OrbitConstellation = () => {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // Initial fade-in after mount.
  useEffect(() => {
    const t = setTimeout(() => setCalloutVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Auto-rotate featured contact, unless the user has pinned or is hovering one.
  useEffect(() => {
    if (pinnedId || hoveredId) return;
    const interval = setInterval(() => {
      setCalloutVisible(false);
      setTimeout(() => {
        setFeaturedIdx((i) => (i + 1) % FEATURED_ORDER.length);
        setCalloutVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [pinnedId, hoveredId]);

  // Make the callout snap visible when the active contact comes from
  // a hover or pin (instead of the timed fade).
  useEffect(() => {
    if (pinnedId || hoveredId) setCalloutVisible(true);
  }, [pinnedId, hoveredId]);

  // The active contact: pinned beats hovered beats the rotation.
  const activeId = pinnedId ?? hoveredId ?? FEATURED_ORDER[featuredIdx];
  const activeContact = useMemo(
    () => CONTACTS.find((c) => c.id === activeId),
    [activeId],
  );
  // Pause orbit rotation while the user is interacting so dots stay clickable.
  const paused = !!hoveredId || !!pinnedId;

  return (
    <div className="relative mx-auto w-full max-w-3xl aspect-square">
      {/* Click-away layer: when a contact is pinned, clicking the empty
          backdrop unpins. Doesn't block dot clicks because it sits below the SVG. */}
      {pinnedId && (
        <button
          type="button"
          aria-label="Close contact preview"
          onClick={() => setPinnedId(null)}
          className="absolute inset-0 z-0 cursor-default"
        />
      )}
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
        aria-label="Your network orbiting around you, with one contact highlighted as needing attention"
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

        {/* Rings — each rotates as a group; dots counter-rotate to stay upright */}
        {RINGS.map((ring, ringIdx) => (
          <g
            key={ringIdx}
            className="orbit-ring"
            style={{
              transformOrigin: `${CENTER}px ${CENTER}px`,
              animation: `orbit-spin ${ring.duration}s linear infinite`,
              animationDirection: ring.direction === 1 ? "normal" : "reverse",
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {CONTACTS.filter((c) => c.ring === ringIdx).map((c) => {
              const rad = (c.angle * Math.PI) / 180;
              const x = CENTER + ring.radius * Math.cos(rad);
              const y = CENTER + ring.radius * Math.sin(rad);
              const featured = c.id === activeId;
              const isHovered = c.id === hoveredId;
              const isPinned = c.id === pinnedId;
              return (
                <g
                  key={c.id}
                  style={{
                    transformOrigin: `${x}px ${y}px`,
                    animation: `orbit-counter ${ring.duration}s linear infinite`,
                    animationDirection:
                      ring.direction === 1 ? "reverse" : "normal",
                    animationPlayState: paused ? "paused" : "running",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() =>
                    setHoveredId((prev) => (prev === c.id ? null : prev))
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setPinnedId((prev) => (prev === c.id ? null : c.id));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPinnedId((prev) => (prev === c.id ? null : c.id));
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${c.name}. ${c.reason}. Click to ${
                    isPinned ? "close" : "pin"
                  } preview.`}
                  aria-pressed={isPinned}
                  className="focus:outline-none focus-visible:[&>circle:nth-of-type(1)]:stroke-primary"
                >
                  {/* Larger invisible hit target — orbit dots are small */}
                  <circle cx={x} cy={y} r={22} fill="transparent" />

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
                    r={featured ? 18 : isHovered ? 17 : 15}
                    fill={featured ? "hsl(var(--primary))" : "hsl(var(--card))"}
                    stroke={
                      featured || isHovered
                        ? "hsl(var(--primary))"
                        : "hsl(var(--border))"
                    }
                    strokeWidth={isHovered && !featured ? 1.75 : 1.25}
                    className={c.dim && !featured && !isHovered ? "opacity-60" : ""}
                    style={{ transition: "all 240ms ease-out" }}
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
                      transition: "fill 240ms ease-out",
                      pointerEvents: "none",
                    }}
                  >
                    {c.initials}
                  </text>
                  {featured && (
                    <CalloutAnchor
                      x={x}
                      y={y}
                      visible={calloutVisible}
                      name={c.name}
                      reason={c.reason}
                      pinned={isPinned}
                      onClose={(e) => {
                        e.stopPropagation();
                        setPinnedId(null);
                        setHoveredId(null);
                      }}
                    />
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
 * Callout card pinned to the featured dot. Uses foreignObject so the card
 * gets crisp HTML typography, then auto-flips its anchor based on where the
 * dot sits in the viewBox so it never falls off-canvas.
 */
const CalloutAnchor = ({
  x,
  y,
  visible,
  name,
  reason,
}: {
  x: number;
  y: number;
  visible: boolean;
  name: string;
  reason: string;
}) => {
  // Flip the callout toward the center side so it stays inside the frame.
  const flipX = x > CENTER ? -1 : 1;
  const flipY = y > CENTER ? -1 : 1;
  const offset = 70;
  const tx = x + offset * flipX;
  const ty = y + offset * flipY * -1; // prefer "up" off the dot

  const cardW = 210;
  const cardH = 64;
  const cardX = flipX === 1 ? tx - 4 : tx - cardW + 4;
  const cardY = ty - cardH / 2;

  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-out`,
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
      <foreignObject x={cardX} y={cardY} width={cardW} height={cardH}>
        <div
          className="rounded-xl border border-border bg-card/95 px-3 py-2 shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.35)] backdrop-blur"
          style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
        >
          <p className="text-[11px] font-semibold tracking-tight text-foreground truncate">
            {name}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
            {reason}
          </p>
        </div>
      </foreignObject>
    </g>
  );
};
