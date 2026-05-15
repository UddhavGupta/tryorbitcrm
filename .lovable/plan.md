Three remaining tracks. Scoped to be shippable in one pass without bloating the codebase.

## Track A — Smarter Relationship Intel

The intel rules in `src/lib/relationshipIntel.ts` are already solid; the gap is **surfacing them** and **acting on them faster**.

1. **Weekly Digest section on the Dashboard** (no new page).
   - New "This week" card alongside Today's reach-outs: top 5 contacts where `getSuggestedAction` ≠ `no_action` and the suggestion is `reconnect_soon` or `send_birthday_note` (i.e. not already in "Today's reach-outs").
   - Each row: name, why it surfaced (the action label), and a "Reach out" button that opens the existing `ReminderDialog` prefilled with that contact and a sensible due date (today for birthdays, +3 days for reconnect).
   - Header: "This week" with a refresh-on-Monday note in muted text.

2. **Contact-level intel card** on `ContactDetail.tsx`:
   - New compact "Relationship intel" card (above Groups). Renders:
     - Status pill (active/warming/cooling/cold) + the human days-since-last-contact
     - Suggested action with a one-line rationale ("High priority and you haven't talked in 73 days")
     - One CTA — "Draft a reach-out" — that opens the existing `InteractionDialog` with a prefilled note template (no AI call; just a 2-line scaffold like "Quick check-in — last connected {date}. Talking points: …").
   - Reuses existing helpers; no new lib code beyond a small `intelRationale(c)` function in `relationshipIntel.ts`.

3. **Cooling tier upgrade** — already 4 tiers; just add the missing **"Warming"** classification chip in the People filter dropdown (it's defined but not selectable). No data changes.

**Out of scope:** AI-generated drafts (would need an edge function + token spend); a full `/digest` page; email sending.

## Track B — Landing & Marketing

Tighten the page so it converts. Keep the structure; sharpen the storytelling.

1. **Hero refresh** (`Landing.tsx` lines 52-82):
   - Add a one-line social-proof strip under the CTAs: "Built for the people whose careers compound on relationships." (text only, no fake logos).
   - Replace "Sign Up" button label with "Start free — no credit card" (we have no payment, but reinforces commitment-low signal).
   - Add subtle product KPIs row above "How it works": three stats — "0 setup", "100% private to you", "Demo in 5 seconds". Static, no fetching.

2. **New "Why OrbitCRM is different" section** (between How-it-works and Built-for):
   - Three-up comparison: "Spreadsheets" / "Big CRMs" / "OrbitCRM" — each a small card with 3 bullets. Frames the product clearly without trashing competitors.

3. **Testimonial-shaped quotes section** (clearly labeled "What the project is for", not fake reviews — keeps it honest as a portfolio piece):
   - 3 quotes phrased as use-cases ("As a job seeker, …", etc.) with the persona, not a real name. Avoids fake-testimonial smell.

4. **Footer cleanup**: the "Operators" footer link wrongly points at `#features` — route it to a real `/for/operators` page (mirror `/for/founders`) OR drop it. We'll route it to `/for/job-seekers` (closest match) and rename the link to "Operators" → still sends to a relevant use-case page. *(Light touch: no new route.)*

**Out of scope:** Real testimonials (none exist); animated screen recordings; pricing page.

## Track C — Visual Polish Pass

Targeted polish, no redesign.

1. **Dashboard StatCards**: tighten — give each card a small trend indicator (e.g. "↑ 2 new this week" for Total contacts using `created_at` filter). For Open/Overdue, show a relative bar (overdue count / total open) as a thin progress strip. Pure presentation; queries already in place.

2. **People page card hover**: the current `hover:-translate-y-0.5` is good but the shadow snap is harsh — switch to a softer 250ms cubic-bezier transition and add a subtle border-color pulse on the favorite star when toggling on (existing animations already in `tailwind.config`).

3. **ContactDetail header**: avatar is a flat gradient. Add a subtle inner ring + ring shadow, and align the priority/status pills horizontally instead of vertically stacked — looks more compact and editorial.

4. **Empty states audit**: standardize illustration spacing — a few pages use `p-10`, others `p-6 text-center`. Pick `p-10` consistently for primary empty states and update mismatched ones (`Groups`, `Reminders`, `Dates`).

5. **Toasts**: shorten our toast copy across the app where I find verbose ones (e.g. "Cooling +30 days (now 60)" → "Cooling: 60 days"). Quick pass.

**Out of scope:** Theme tokens overhaul; new icons; animation library swap.

## Order & rollout

A → B → C in one session. Each track is self-contained, so we can ship sequentially without merge concerns.

## Files touched (planned)

- `src/lib/relationshipIntel.ts` — add `intelRationale(c)`.
- `src/pages/Dashboard.tsx` — "This week" card + StatCard tweaks.
- `src/pages/ContactDetail.tsx` — Relationship intel card; visual polish on header.
- `src/pages/People.tsx` — add "Warming" filter option; hover transition tweak.
- `src/pages/Landing.tsx` — hero copy, comparison section, quotes section, footer link fix.
- `src/pages/Reminders.tsx`, `src/pages/Groups.tsx`, `src/pages/Dates.tsx` — empty-state spacing pass.
- Misc: toast copy trim across pages I touch.

No DB migrations. No new dependencies. No new routes.
