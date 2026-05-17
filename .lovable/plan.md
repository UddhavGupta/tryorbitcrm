# Landing v2 — "Quietly Premium"

Goal: same warm/editorial soul, but with depth, motion, and proof. Notion/Superhuman energy.

## 1. Hero + live dashboard preview

**Headline area**
- Keep the rotating word, add a soft animated aurora-style gradient blob behind the headline (very low opacity, slow drift). Adds depth without noise.
- Tighten the CTA row: primary button gets a 1px gradient border + subtle inner glow on hover. Secondary stays ghost.
- Add a thin "trusted by" strip under the CTAs — 4–5 monospaced labels ("Students at Stanford, NYU, BITS · Founders in YC, On Deck") instead of fake logos (honest for a portfolio project).

**Dashboard mock → alive**
- Wrap in a tilted/floating container with a soft radial gradient halo behind it.
- Animate on a 3–4s loop:
  - "Today's reach-outs" count ticks 3 → 4 with a new row sliding in.
  - A birthday row flips "Today" → "🎉 sent" after a beat.
  - Cooling counter increments "47d cold" → "48d cold" with a subtle pulse.
- Add scroll-parallax: dashboard lifts ~20px as user scrolls past hero.
- Reflection/fade at the bottom edge so it looks like it's floating on a surface.

## 2. Scroll-reveal & micro-animations (page-wide)

- Every section: fade-up + 16px translate on enter, staggered for grids (50ms between cards). Use IntersectionObserver, one shared hook.
- Cards (`surface-card`): tilt-on-hover (max 4° via CSS transform), shadow expands, primary tint warms.
- Number/stat moments: count-up animation when scrolled into view.
- Sticky header already done — add a subtle shadow + tighter padding once scrolled >40px.
- All animations respect `prefers-reduced-motion`.

## 3. Restructure content (proof + trust)

Current page has redundancy. New order:

```text
Hero (animated dashboard)
  ↓
Trusted-by strip (honest labels)
  ↓
Product tour — 3-screenshot carousel
   (People view · Contact detail · Reminders)
  ↓
"Three steps to a warmer network" (keep, polish icons)
  ↓
Weekly digest preview
   ("This is what lands in your inbox Monday morning")
   — mock email card with 3 reach-outs, 1 birthday, 1 cooling alert
  ↓
"Built for network-heavy people" (keep)
  ↓
Testimonials — 3 portfolio quotes, framed as honest
   ("Used during my MBA recruiting — Anya, '26")
  ↓
FAQ — 5 questions
   (Is my data private? · Can I import contacts? · Is it really free?
    · Does it sync with LinkedIn? · Why not just a spreadsheet?)
  ↓
Final CTA + footer
```

**Dropped:** Comparison table (Spreadsheets / Big CRMs / OrbitCRM) — duplicates "Why OrbitCRM" message. Merge its best line ("Built around relationships, not deals") into hero subtitle area.

**Dropped:** The 3 KPI strip ("0 setup / Private / Demo in 5s") — moves into FAQ answers where it belongs.

## 4. Typography & visual system polish

- **One oversized stat moment** between sections: "Remember 12,400 birthdays. Never miss one again." Set in display serif at ~96px, centered, lots of whitespace.
- **Vary section rhythm**: alternate eyebrow placement (centered, then left-aligned, then no eyebrow at all). Stops the templated feel.
- **Custom duotone icons** for the 3 "how it works" steps — hand-styled SVGs in primary + primary-soft, not Lucide. Same for feature grid.
- **Section dividers**: thin gradient hairlines instead of hard borders.
- **Card depth tokens**: add `--shadow-lift-sm` and `--shadow-lift-md` to index.css. Replace ad-hoc shadows.
- **Footer**: add a final big serif sign-off ("Stay in orbit.") above the columns.

## Technical notes

- New hook: `useInView` (IntersectionObserver wrapper) — used by all reveal components.
- New component: `AnimatedDashboard` — replaces current `DashboardPreview`. Uses `useState` + `setInterval` for the loop; pauses when off-screen.
- New components: `ScreenshotCarousel`, `DigestPreview`, `Testimonials`, `Faq`, `BigStat`, `RevealOnScroll`.
- All animations use Tailwind classes + CSS keyframes already in `tailwind.config.ts`; no new deps.
- Mocked screenshots for the carousel: build them as React components (same approach as current dashboard mock) so they stay crisp and themable.
- All copy stays honest about being a portfolio project — testimonials labeled as scenarios, not real users.

## What I'm explicitly NOT changing

- Brand colors, fonts, or the rotating-word component (already working).
- Routing, auth, or any app functionality.
- The portfolio disclaimer (kept prominent).

## Rollout

Single PR replacing `src/pages/Landing.tsx` plus the new components above. Existing visual regression test (`landing-headline.test.tsx`) keeps passing — extended with one new check that the hero dashboard renders without `overflow-hidden` ancestors clipping it.
