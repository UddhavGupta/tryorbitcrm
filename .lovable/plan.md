# Phase 5 — Onboarding tour

A tiny in-house tour overlay that runs once for newly signed-up users, with a replay link in the user menu and inline "load sample data" CTAs on empty pages. No new dependencies.

## Scope

1. **`profiles.onboarded_at` column** (migration). Set when the user finishes or skips the tour.
2. **`<TourOverlay />` + `useTour()` hook** (~150 LOC, no deps). Renders a fixed dim layer with a spotlight cutout around the target element, a popover card with title/body/Skip/Next/Done, and dot pagination. Targets selected by `data-tour="..."` attributes already added to existing nav/buttons.
3. **5 steps**:
   1. Welcome — Dashboard intro (anchor: nav `Dashboard` link)
   2. Add your first contact (anchor: People nav + the "Add contact" button on `/app/people`)
   3. Set a reminder (anchor: Reminders nav)
   4. Cooling alerts (anchor: a Dashboard cooling card)
   5. You're set — CTA to "Load sample data" or "Start fresh"
4. **Trigger logic**: in `AppLayout`, on mount, if user is real (not anonymous demo) and `profiles.onboarded_at IS NULL`, start tour. Persist completion/skip by writing `onboarded_at = now()`.
5. **Replay**: add "Replay tour" item in `UserMenu` dropdown (real users only) that resets local state and starts the tour without clearing `onboarded_at`.
6. **Empty-state CTAs**: on People / Reminders / Groups empty states, add a secondary "Load sample data" button that calls existing `seedDemo()` adapted for the real user's `user_id` (insert sample contacts/reminders/groups). Confirm dialog before insert.

## Out of scope

- Coach marks beyond the 5 steps
- Video/animated walkthroughs
- Tour analytics
- Public profiles (Phase 6)

## Technical notes

- New files: `src/components/Tour.tsx` (overlay + steps + hook), `supabase/migrations/*` for `alter table profiles add column onboarded_at timestamptz`.
- Edits: `AppLayout.tsx` (mount tour), `UserMenu.tsx` (replay item), `People.tsx` / `Reminders.tsx` / `Groups.tsx` (sample-data CTA in EmptyState), and `data-tour` attrs on nav links + a couple of buttons.
- Spotlight: compute target `getBoundingClientRect()`, render via portal; recompute on resize/scroll. Tab-trap inside popover. Esc = skip.
- Anonymous demo sessions skip the tour entirely (they already have seeded data and a different intent).
- Sample data helper lives in `src/lib/seedDemo.ts` (rename of existing demo seeder if needed) and reuses current insert logic with the real `user_id`.

## Rollout order

Migration → Tour component + hook → AppLayout wiring + data-tour attrs → UserMenu replay → empty-state sample-data CTAs.
