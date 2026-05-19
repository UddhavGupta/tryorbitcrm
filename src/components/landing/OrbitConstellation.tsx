import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Briefcase, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * OrbitConstellation — branded hero visual.
 * A you-in-the-center diagram with three rotating orbit rings of contact
 * dots. The "featured" contact rotates every few seconds — pulsing in primary
 * with a callout describing why they need attention.
 *
 * Pure CSS animations for the orbits (no JS RAF loop) — respects
 * prefers-reduced-motion.
 */

type Interaction = {
  /** Human-readable relative date, e.g. "14 days ago", "Last Tue", "Aug 12" */
  when: string;
  kind: "note" | "meeting" | "call" | "email" | "intro" | "text";
  text: string;
};

type Contact = {
  id: string;
  initials: string;
  name: string;
  /** small grey eyebrow above the name, e.g. "Friend · NYC" */
  meta?: string;
  ring: 0 | 1 | 2;
  /** angle in degrees on the ring, 0 = right, 90 = bottom */
  angle: number;
  /** short reason that appears in the callout when this contact is featured */
  reason: string;
  /** small status chip in the top-right of the card, e.g. "14d", "Today" */
  badge?: string;
  dim?: boolean;
  // ---- Profile details surfaced in the contact modal
  title?: string;
  company?: string;
  city?: string;
  email?: string;
  /** Status pill in the modal header */
  status?: string;
  /** Most-recent-first list of interactions */
  interactions?: Interaction[];
};

const CONTACTS: Contact[] = [
  // Inner ring — closest
  {
    id: "ma", initials: "MA", name: "Maya Chen", meta: "Mentor · NYC",
    ring: 0, angle: 312, badge: "14d",
    reason: "It's been 14 days since your last note. A quick hello would land warm.",
    title: "Design Director", company: "Lattice", city: "Brooklyn, NY",
    email: "maya@example.com", status: "Cooling off",
    interactions: [
      { when: "14 days ago", kind: "note", text: "Sent her the portfolio review notes she asked for." },
      { when: "Apr 22", kind: "meeting", text: "Coffee in Williamsburg — discussed her team's hiring plans for Q3." },
      { when: "Mar 30", kind: "intro", text: "Introduced her to Devon at Stripe re: design ops role." },
      { when: "Feb 14", kind: "email", text: "Birthday wishes + caught up on the new house." },
    ],
  },
  {
    id: "jl", initials: "JL", name: "Jordan Lee", meta: "Friend · LA",
    ring: 0, angle: 70, badge: "🎂",
    reason: "Birthday next Tuesday — send something thoughtful.",
    title: "Founder", company: "Quill", city: "Los Angeles, CA",
    email: "jordan@example.com", status: "Birthday soon",
    interactions: [
      { when: "Last Sat", kind: "text", text: "Sent the trail map for the Topanga hike." },
      { when: "May 3", kind: "call", text: "30 min on fundraising — they're closing a small seed." },
      { when: "Apr 11", kind: "meeting", text: "Lunch at Gjelina with Kenji." },
    ],
  },
  {
    id: "rs", initials: "RS", name: "Rohan Shah", meta: "Classmate",
    ring: 0, angle: 190, badge: "Due",
    reason: "You promised an intro 3 weeks ago. Still on?",
    title: "PM", company: "Notion", city: "San Francisco, CA",
    email: "rohan@example.com", status: "Owed an intro",
    interactions: [
      { when: "3 weeks ago", kind: "note", text: "Promised to intro to Sara at Sequoia about the side project." },
      { when: "Apr 28", kind: "call", text: "Catching up on b-school reunions." },
      { when: "Mar 18", kind: "email", text: "He sent the deck for early feedback." },
    ],
  },

  // Middle ring
  {
    id: "pk", initials: "PK", name: "Priya Kapoor", meta: "Ex-colleague",
    ring: 1, angle: 25, reason: "Started a new role at Figma.",
    title: "Eng Manager", company: "Figma", city: "New York, NY",
    email: "priya@example.com", status: "New role",
    interactions: [
      { when: "Mon", kind: "note", text: "Saw her LinkedIn post — congratulated her on the Figma role." },
      { when: "Feb 9", kind: "meeting", text: "Coffee at Devoción — discussed her interview loops." },
    ],
  },
  {
    id: "an", initials: "AN", name: "Ana Navarro", meta: "Friend · CDMX",
    ring: 1, angle: 110, reason: "Coffee chat overdue — 6 weeks.",
    title: "Brand Strategist", company: "Independent", city: "Mexico City",
    email: "ana@example.com", status: "Overdue",
    interactions: [
      { when: "6 weeks ago", kind: "call", text: "Caught up on her client roster and the move to CDMX." },
      { when: "Feb 2", kind: "intro", text: "Connected her with Hana for a podcast collab." },
    ],
  },
  {
    id: "tc", initials: "TC", name: "Tomás Cruz", meta: "Recruiter",
    ring: 1, angle: 200, dim: true,
    reason: "Mentioned hiring — follow up.",
    title: "Talent Partner", company: "Index Ventures", city: "London, UK",
    email: "tomas@example.com", status: "Warm intro lead",
    interactions: [
      { when: "10 days ago", kind: "email", text: "Mentioned a portco hiring a head of design." },
      { when: "Jan 25", kind: "meeting", text: "Coffee in Shoreditch — overview of their hiring slate." },
    ],
  },
  {
    id: "ev", initials: "EV", name: "Elena Voss", meta: "Investor",
    ring: 1, angle: 290, reason: "Cooling off — last spoke Aug 12.",
    title: "Partner", company: "Hawk Capital", city: "Berlin, DE",
    email: "elena@example.com", status: "Cooling off",
    interactions: [
      { when: "Aug 12", kind: "call", text: "Quarterly check-in — she's leaning into developer tools." },
      { when: "Jun 4", kind: "intro", text: "Introduced her to Devon's founder." },
    ],
  },

  // Outer ring — looser orbit
  {
    id: "ha", initials: "HA", name: "Hana Abe", meta: "Operator", ring: 2, angle: 15, dim: true,
    reason: "Sent a deck — circle back.",
    title: "Chief of Staff", company: "Loom", city: "Tokyo, JP",
    email: "hana@example.com", status: "Awaiting response",
    interactions: [
      { when: "9 days ago", kind: "email", text: "Sent her the GTM deck for thoughts." },
      { when: "Apr 1", kind: "meeting", text: "Dinner in Shibuya with the Loom team." },
    ],
  },
  {
    id: "ds", initials: "DS", name: "Devon Sato", meta: "Friend · Stripe", ring: 2, angle: 75,
    reason: "Anniversary at Stripe today.",
    title: "Staff PM", company: "Stripe", city: "San Francisco, CA",
    email: "devon@example.com", status: "Milestone today",
    interactions: [
      { when: "Today", kind: "note", text: "5 years at Stripe — drop a quick congrats." },
      { when: "Apr 30", kind: "meeting", text: "Lunch at Souvla." },
    ],
  },
  {
    id: "mo", initials: "MO", name: "Maya Okonkwo", meta: "Mentor", ring: 2, angle: 150,
    reason: "Mentor — quarterly check-in.",
    title: "VP Product", company: "Atlassian", city: "Lagos, NG",
    email: "maya.o@example.com", status: "Quarterly cadence",
    interactions: [
      { when: "Last quarter", kind: "call", text: "Career retro — talked about staying technical as you grow." },
    ],
  },
  {
    id: "kn", initials: "KN", name: "Kenji Noma", meta: "Friend", ring: 2, angle: 220, dim: true,
    reason: "Asked about the Lagos trip.",
    title: "Photographer", company: "Independent", city: "Osaka, JP",
    email: "kenji@example.com", status: "Awaiting reply",
    interactions: [
      { when: "5 days ago", kind: "text", text: "Asked how the Lagos trip went and if photos are up." },
    ],
  },
  {
    id: "sb", initials: "SB", name: "Sara Bennett", meta: "Investor", ring: 2, angle: 300,
    reason: "Investor intro pending.",
    title: "Partner", company: "Sequoia", city: "Menlo Park, CA",
    email: "sara@example.com", status: "Pending intro",
    interactions: [
      { when: "2 weeks ago", kind: "email", text: "Confirmed she's open to an intro from Rohan." },
      { when: "Mar 11", kind: "meeting", text: "Met at the Sequoia founder dinner." },
    ],
  },
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

// The SVG is wider than tall so the rotating callout cards never get cropped
// on the left/right edges. Orbits stay centered at (CENTER_X, CENTER_Y); the
// vertical footprint is unchanged from the original 600x600 layout.
const CENTER_X = 460;
const CENTER_Y = 300;
const VIEW_W = 920;
const VIEW_H = 600;

export const OrbitConstellation = () => {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [calloutVisible, setCalloutVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // Initial fade-in after mount.
  useEffect(() => {
    const t = setTimeout(() => setCalloutVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Auto-rotate featured contact, unless the modal is open or a dot is hovered.
  useEffect(() => {
    if (openId || hoveredId) return;
    const interval = setInterval(() => {
      setCalloutVisible(false);
      setTimeout(() => {
        setFeaturedIdx((i) => (i + 1) % FEATURED_ORDER.length);
        setCalloutVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [openId, hoveredId]);

  // Make the callout snap visible when a hover changes the active contact.
  useEffect(() => {
    if (hoveredId) setCalloutVisible(true);
  }, [hoveredId]);

  // The active (spotlit) contact for the callout: hover beats the rotation.
  const activeId = hoveredId ?? FEATURED_ORDER[featuredIdx];
  // Pause orbit rotation while the user is hovering so dots stay clickable.
  const paused = !!hoveredId;

  const openContact = CONTACTS.find((c) => c.id === openId) ?? null;

  return (
    <div className="relative mx-auto w-full max-w-6xl" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
      {/* Soft aurora wash behind the orbits */}
      <div
        aria-hidden
        className="absolute inset-[10%] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.22), transparent 65%)",
        }}
      />
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
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
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

        {/* Orbit rings — brass hairline guides */}
        {RINGS.map((r, i) => (
          <circle
            key={i}
            cx={CENTER_X}
            cy={CENTER_Y}
            r={r.radius}
            fill="none"
            stroke="hsl(var(--brass))"
            strokeOpacity={0.28}
            strokeWidth={1}
          />
        ))}

        {/* Center: you */}
        <g>
          <circle cx={CENTER_X} cy={CENTER_Y} r={70} fill="url(#orb-core)" />
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={26}
            fill="hsl(var(--card-elevated))"
            stroke="hsl(var(--brass))"
            strokeWidth={1}
          />
          <text
            x={CENTER_X}
            y={CENTER_Y + 5}
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
              transformOrigin: `${CENTER_X}px ${CENTER_Y}px`,
              animation: `orbit-spin ${ring.duration}s linear infinite`,
              animationDirection: ring.direction === 1 ? "normal" : "reverse",
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {CONTACTS.filter((c) => c.ring === ringIdx).map((c) => {
              const rad = (c.angle * Math.PI) / 180;
              const x = CENTER_X + ring.radius * Math.cos(rad);
              const y = CENTER_Y + ring.radius * Math.sin(rad);
              const featured = c.id === activeId;
              const isHovered = c.id === hoveredId;
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
                    setOpenId(c.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenId(c.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open profile for ${c.name}. ${c.reason}`}
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
                        r={22}
                        fill="none"
                        stroke="hsl(var(--brass))"
                        strokeOpacity={0.75}
                        strokeWidth={1}
                        className="orbit-pulse"
                      />
                    </>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={featured ? 18 : isHovered ? 17 : 15}
                    fill={featured ? "hsl(var(--primary))" : "hsl(var(--card-elevated))"}
                    stroke={
                      featured
                        ? "hsl(var(--primary))"
                        : isHovered
                        ? "hsl(var(--primary))"
                        : "hsl(var(--brass) / 0.6)"
                    }
                    strokeWidth={isHovered && !featured ? 1.5 : 1}
                    className={c.dim && !featured && !isHovered ? "opacity-70" : ""}
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
                      meta={c.meta}
                      reason={c.reason}
                      badge={c.badge}
                      onOpen={() => setOpenId(c.id)}
                    />
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>

      {/* Contact profile modal */}
      <ContactProfileDialog
        contact={openContact}
        onOpenChange={(o) => !o && setOpenId(null)}
      />

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
 * Callout card pinned to the active dot. Uses foreignObject so the card
 * gets crisp HTML typography. Auto-flips its anchor based on where the
 * dot sits in the viewBox so it never falls off-canvas. When `pinned`,
 * grows to show a "View profile" CTA + close button.
 */
const CalloutAnchor = ({
  x,
  y,
  visible,
  name,
  meta,
  reason,
  badge,
  onOpen,
}: {
  x: number;
  y: number;
  visible: boolean;
  name: string;
  meta?: string;
  reason: string;
  badge?: string;
  onOpen?: () => void;
}) => {
  // Flip the callout toward the center side so it stays inside the frame.
  const flipX = x > CENTER_X ? -1 : 1;
  const offsetX = 92;
  const offsetY = 92;
  const tx = x + offsetX * flipX;
  const ty = y - offsetY;

  const cardW = 232;
  const cardH = 96;
  const cardX = flipX === 1 ? tx - 6 : tx - cardW + 6;
  const cardY = ty - cardH / 2;

  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <line
        x1={x}
        y1={y}
        x2={tx}
        y2={ty}
        stroke="hsl(var(--primary))"
        strokeOpacity={0.45}
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <circle cx={tx} cy={ty} r={2.5} fill="hsl(var(--primary))" />

      <foreignObject x={cardX} y={cardY} width={cardW} height={cardH}>
        <div
          className="rounded-2xl border border-border bg-card/95 px-3.5 py-2.5 shadow-[0_14px_36px_-14px_hsl(var(--primary)/0.4)] backdrop-blur"
          style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {meta && (
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/80 font-medium truncate">
                  {meta}
                </p>
              )}
              <p className="text-[12px] font-semibold tracking-tight text-foreground truncate leading-tight mt-0.5">
                {name}
              </p>
            </div>
            {badge && (
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[9px] font-semibold leading-none shrink-0">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-muted-foreground leading-snug mt-1.5 line-clamp-2">
            {reason}
          </p>
          {onOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
            >
              Open profile <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </foreignObject>
    </g>
  );
};

// ============================================================
// Contact Profile Dialog
// ============================================================

const KIND_LABEL: Record<Interaction["kind"], string> = {
  note: "Note",
  meeting: "Meeting",
  call: "Call",
  email: "Email",
  intro: "Intro",
  text: "Text",
};

const ContactProfileDialog = ({
  contact,
  onOpenChange,
}: {
  contact: Contact | null;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={!!contact} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {contact && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 via-card to-card px-6 pt-6 pb-5 border-b border-border">
              <DialogHeader className="space-y-0 text-left">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center font-semibold text-base shrink-0 shadow-sm">
                    {contact.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    {contact.meta && (
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
                        {contact.meta}
                      </p>
                    )}
                    <DialogTitle className="font-display text-xl tracking-tight leading-tight mt-0.5">
                      {contact.name}
                    </DialogTitle>
                    {contact.status && (
                      <span className="inline-flex items-center mt-2 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold">
                        {contact.status}
                      </span>
                    )}
                  </div>
                </div>
                <DialogDescription className="mt-3 text-sm text-foreground/80 leading-relaxed">
                  {contact.reason}
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Details */}
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm border-b border-border">
              {(contact.title || contact.company) && (
                <DetailRow
                  icon={<Briefcase className="h-3.5 w-3.5" />}
                  label="Role"
                  value={[contact.title, contact.company].filter(Boolean).join(" · ")}
                />
              )}
              {contact.city && (
                <DetailRow
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Location"
                  value={contact.city}
                />
              )}
              {contact.email && (
                <DetailRow
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Email"
                  value={contact.email}
                />
              )}
              {contact.interactions?.[0] && (
                <DetailRow
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Last touch"
                  value={contact.interactions[0].when}
                />
              )}
            </div>

            {/* Interaction history */}
            <div className="px-6 py-5 max-h-[280px] overflow-y-auto">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium mb-3">
                Interaction history
              </p>
              {contact.interactions && contact.interactions.length > 0 ? (
                <ol className="relative border-l border-border ml-1.5 space-y-4">
                  {contact.interactions.map((it, i) => (
                    <li key={i} className="pl-4 relative">
                      <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary/80 ring-2 ring-card" />
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                          {KIND_LABEL[it.kind]}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {it.when}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/85 mt-1 leading-relaxed">
                        {it.text}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No interactions logged yet.
                </p>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 bg-card-muted/40 border-t border-border flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground italic">
                Sample contact — try it with your own people.
              </p>
              <Button asChild size="sm" className="gradient-primary">
                <Link to="/demo">
                  Try the demo <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-2.5 min-w-0">
    <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      <p className="text-sm text-foreground truncate">{value}</p>
    </div>
  </div>
);
