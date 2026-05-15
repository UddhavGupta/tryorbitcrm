
# Finish the growth plan — phases 1, 5, 6

Three tightly-scoped shippable bundles. Each is pragmatic and avoids rewriting the entire data layer.

## Phase 1 — Shareable demo (`/demo`)

The original plan's "no-auth, localStorage-backed demo" would require a full data-layer abstraction across ~13 files. Instead, ship a faster equivalent that delivers the same outcome (anyone hits a link, instantly sees a working app):

- **New route `/demo`** that:
  - Auto-runs `startDemo()` on mount (no button click).
  - Shows a calm centered shimmer ("Spinning up your demo…") while the anonymous session and seed are created.
  - Redirects to `/app` when ready.
- **Friendly demo banner** inside `AppLayout` when the active session is anonymous: a slim sticky bar reading *"You're in demo mode — sign up to save your changes"* with a "Sign up" button. (`DemoBadge` already exists; extend it.)
- **Share button on landing** next to "Start Demo": copies `https://orbitcrm.guptau.com/demo` to clipboard with a toast. Lets people DM the link to friends without thinking.
- **`/demo` link replaces `Start Demo` buttons** that currently call `handleStartDemo()` directly (Landing hero, Landing CTA section, Auth side panel, Auth mobile button) — they all just `<Link to="/demo">` instead. The auto-seed runs once on demo mount.
- **Idempotent seed**: existing `seedDemo()` already wipes-and-reseeds, so re-hitting `/demo` resets the experience cleanly.

Why this scope: 90% of the value (instantly shareable URL) for 10% of the work. The localStorage-only demo stays available as a future upgrade if you ever want a true logged-out experience.

## Phase 5 — Onboarding that converts

A focused first-run tour for **real** sign-ups (skipped for anonymous demo sessions):

- **Lightweight in-house tour** (no new dep) — a `<TourOverlay>` component using a portal + simple anchored tooltips driven by `data-tour="step-id"` attributes on existing UI elements. 5 steps:
  1. Dashboard intro (the cards).
  2. "Add your first contact" → highlights the People nav item, opens contact dialog when clicked.
  3. "Set a follow-up reminder" → highlights reminder field in contact dialog.
  4. "Cooling alerts" → back to dashboard, highlights the cooling card.
  5. Done — friendly close.
- **Trigger logic**: shown once per real user; persisted via `profiles.onboarded_at` timestamp (added in a small migration). Skipped for anonymous demo sessions.
- **"Replay tour" link** in the `UserMenu` so people can revisit it.
- **Inline "load sample data" CTA** on empty People/Groups pages for real users who skip the tour — runs the same `seedDemo()` against the real account on confirmation.

## Phase 6 — Public profile / shareable contact cards

The most adventurous piece. Scoped down to one shippable shape:

- **Schema**: new `public_profiles` table (`user_id`, `slug`, `display_name`, `headline`, `bio`, `avatar_url`, `published bool`, `created_at`). RLS: anyone can `select` rows with `published = true`; only the owner can insert/update/delete their row.
- **New `featured` boolean on `contacts`** (owner-only writes). When the owner publishes their profile, only `featured = true` contacts are exposed publicly (read-only subset: name, role, company, optional one-line note — no emails, phones, birthdays, or notes).
- **Settings page (`/app/profile`)**: pick a slug, write a headline + bio, toggle "publish my page", and pick which contacts to feature ("People I'd love to introduce you to" — checkbox list, max 12).
- **Public route `/u/:slug`**: full marketing-style page with the user's headline, bio, avatar, and the featured contact cards as a clean grid. No auth. Per-route SEO via the existing `<SEO>` component. "Built with OrbitCRM →" footer link.
- **Share buttons** on `/u/:slug` (Twitter / LinkedIn / copy link), powered by the existing `<MarketingPage>` share component.

Why this matters: every published profile becomes outbound marketing for OrbitCRM with zero ad spend.

## Out of scope (for later)

- Localstorage-only demo with no anonymous auth (only ship if anon-auth limits become a problem).
- PDF export of contact lists.
- "Built with OrbitCRM" badge as an embedded widget.

## Suggested rollout

1. **Phase 1 first** — small surface, immediate value, unblocks distribution.
2. **Phase 6 second** — the schema migration is simple, but it produces public artifacts that compound.
3. **Phase 5 last** — most code, lowest urgency once the demo is shareable.

Each phase ships independently. Pause between any of them.

## Technical notes

- `/demo` page: a single-purpose component that calls `startDemo()` in a `useEffect`, navigates to `/app` on success, surfaces errors via toast and a retry button. No data-layer refactor required.
- Tour: ~150 LOC in a single `Tour.tsx` + a small `useTour()` hook reading/writing `profiles.onboarded_at`. No `react-joyride` install.
- Public profiles migration: one `public_profiles` table + one `featured` column on `contacts` + RLS policies. Profile page reads via `supabase.from("public_profiles").select("*, user:user_id(...)")` filtered to `published = true`.
- Slug uniqueness: enforced by a unique index on `public_profiles.slug`; UI shows availability check on blur.
- All new public pages get `<SEO>` and a sitemap entry update (the generator script already exists; published profile slugs are added by extending `entries` with a Supabase fetch in the script).
