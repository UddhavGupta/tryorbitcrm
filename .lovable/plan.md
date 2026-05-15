
# Design polish plan

Goal: make OrbitCRM feel more refined and consistent end-to-end without changing functionality. Current foundation (warm off-white, maroon primary, Newsreader display, Inter body) is solid — this pass tightens execution.

## What changes

### 1. Typography system
- Adopt a clearer scale (display / h1 / h2 / h3 / body / small / micro) with consistent line-heights and tracking. Today, headings mix `font-display` and `font-semibold` ad-hoc.
- Use Newsreader (display) consistently for page titles ("Today", "People", "Groups", "Dates", "Reminders") — currently only landing uses it.
- Standardize uppercase eyebrow labels (size, tracking, weight, color).
- Add `font-feature-settings` for tabular numerals on stat cards and date columns.

### 2. Spacing & rhythm
- Normalize section padding (`py-16/24/32` on landing, `py-6/8` in app) into a small set of tokens.
- Increase breathing room inside `surface-card` panels on dashboard; align internal gutters.
- Unify card radii (cards `1rem`, inner chips `0.5rem`, buttons `0.75rem`).

### 3. App shell (AppLayout)
- Refine header: thinner border, subtle backdrop blur tweak, active nav link gets a soft underline + accent background instead of just background fill.
- Better avatar + sign-out grouping (popover menu with email + sign out, instead of a bare icon button).
- Improve mobile nav: pill-style tabs with icons, subtle shadow on scroll.

### 4. Dashboard
- Stat cards: larger numerals, tabular figures, subtle hover lift, tone-aware icon backgrounds (soft tint instead of flat color).
- Section cards: clearer header with eyebrow + title + count chip aligned; consistent empty/zero states.
- Reach-outs row: align checkbox, title, contact, and date into a clean grid; date pill gets soft background instead of plain colored text.
- Cooling alerts: stack status + action chips with consistent gap; truncate role lines reliably.

### 5. Landing page
- Hero: tighten vertical rhythm, slightly larger eyebrow, refine gradient transition into the dashboard preview (currently `-mt-6/-10` overlap can clip on some viewports).
- Dashboard preview: subtle elevated shadow, slightly more padding, monospace URL chip styled better.
- "Three steps" + features sections: unify card style (currently two slightly different patterns), add a connecting motif (number + icon) so they feel like one family.
- "Built for network-heavy people": replace soft gradient block with bordered cards on a clean surface — current nested gradient feels heavy.

### 6. Motion (subtle, no new deps)
- Add Tailwind `transition-*` to interactive surfaces (cards, nav, buttons) — soft hover lift (`hover:-translate-y-0.5`, `hover:shadow-elevated`).
- Fade/slide-in on dashboard sections using CSS keyframes (no Framer Motion add).
- Respect `prefers-reduced-motion`.

### 7. Empty / loading / error states
- Standardize empty-state component (icon + headline + supporting text + optional action) and reuse across Dashboard, People, Groups, Dates, Reminders.
- Skeleton loaders for dashboard sections instead of blank cards.

### 8. Forms & dialogs
- Tighten ContactDialog / ReminderDialog / GroupDialog spacing and section dividers.
- Consistent label style, helper text color, required-field indicator.

## Out of scope
- No changes to data model, business logic, auth, or routing.
- No new dependencies (Framer Motion, etc.) — stick with Tailwind + CSS.
- Color palette stays; only token usage and tone tints get more consistent.

## Technical notes
- Extend `src/index.css` with: typography utility classes (`.eyebrow`, `.display-xl`, `.display-lg`, `.num-tabular`), motion keyframes (`@keyframes fade-up`), and a couple of helper components (`.btn-soft`, `.chip-tone-*`).
- Add `tailwind.config.ts` extensions for `fontFamily.display`, `boxShadow.lift`, `keyframes/animation` for `fade-up`.
- Refactor: `AppLayout`, `Dashboard`, `Landing`, plus light touch-ups in `People`, `Groups`, `Dates`, `Reminders`, `ContactDialog`, `ReminderDialog`, `GroupDialog`, and shared `LoadingStates`.
- New small components: `src/components/EmptyState.tsx`, `src/components/PageHeader.tsx`, `src/components/UserMenu.tsx`.

## Suggested rollout (one PR per step so you can review incrementally)
1. Tokens + typography utilities (`index.css`, `tailwind.config.ts`)
2. App shell polish (`AppLayout` + new `UserMenu`, `PageHeader`)
3. Dashboard polish + skeletons + `EmptyState`
4. Landing refinements
5. People / Groups / Dates / Reminders consistency pass
6. Dialog spacing/labels pass
