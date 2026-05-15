
# Growth & Shareability Plan

Goal: turn OrbitCRM from a private portfolio app into something people can discover, share, and pass around. Built for all three audiences (job seekers, founders, students) without picking a winner.

## The big bets

### 1. Shareable demo (the killer feature for a portfolio CRM)

The current "Start Demo" creates an anonymous account no one can hand to a friend. Replace with a true shareable experience:

- **`/demo` public route**: read-only, no auth required, pre-loaded with curated fictional data. Visitors land directly on a working dashboard — no signup wall, no spinner, no "create temp account" friction.
- **"Try the demo" buttons everywhere** link to `/demo` instead of triggering signInAnonymously.
- **"Sign up to save your changes" banner** floats over the demo, converting curiosity into accounts.
- **Persistent demo dataset** stored client-side in `localStorage` so visitors can edit, add, and play freely without backend writes.

Why this matters: someone can DM their friend "check this out → orbitcrm.guptau.com/demo" and they instantly see the product working. Today they hit a logo and have to commit to "Start Demo" first.

### 2. Public showcase / case-study pages

Portfolio projects live or die by how well you tell their story. Add Markdown-driven public pages:

- **`/about`** — the why behind OrbitCRM, your design process, screenshots, technical decisions.
- **`/use-cases/job-seekers`**, **`/use-cases/founders`**, **`/use-cases/students`** — one focused page per audience with hero copy, real workflows ("here's how a job seeker would use this"), screenshots, CTAs. Linked from the landing-page "Built for" section.
- **`/changelog`** already exists — promote it on the landing page footer with the latest entry preview ("Latest: v0.5 — Smarter cooling alerts").

These pages are the SEO surface area; landing alone won't rank for anything.

### 3. SEO foundation (zero today)

- **Per-route meta** via `react-helmet-async`: each public page gets its own `<title>`, description, canonical, and OG tags. Today every URL renders the same OG image and title.
- **`sitemap.xml`** generator running on `predev` / `prebuild` covering `/`, `/auth`, `/changelog`, `/project-notes`, `/about`, `/use-cases/*`, `/demo`.
- **`robots.txt`** allowing crawlers and pointing to the sitemap. Disallow `/app/*` (the private application).
- **Organization + WebSite JSON-LD** in `index.html`.
- **Polished OG image** generated specifically for OrbitCRM (using the `product-shot` skill on a real screenshot) instead of the auto-captured preview thumbnail.
- **Real keyword targets**: validate "personal CRM", "track networking contacts", "follow up reminder app" with Semrush before committing copy.

### 4. Built-in shareability inside the app

- **"Share this contact" / "Share this list"** export to a clean PDF or copyable plain-text snippet (no real PII, just the structure) — gives signed-in users something to send to friends with a "made with OrbitCRM" footer.
- **Public profile cards**: optional `/u/<handle>` page where a user can publish a curated subset (e.g., "people I'd love to introduce you to") — turns the app into something with outward-facing artifacts.
- **"Built with OrbitCRM" footer badge** on shared artifacts, linking back to landing.

### 5. Onboarding that converts

- **Interactive product tour** on first sign-in (5 steps using a lightweight library or custom tooltips): adds a contact, sets a reminder, opens cooling alerts, completes a follow-up, ends on dashboard.
- **Empty-state CTAs** that ship sample data inline ("not sure where to start? Load 5 example contacts") instead of an all-or-nothing demo seed.

### 6. Social proof & trust signals on landing

- **"As featured on" / "Built by Uddhav" credibility row** with LinkedIn, GitHub, portfolio links above the fold.
- **A real screenshot carousel** (mobile + dashboard + contact detail) instead of just the dashboard preview.
- **Testimonial slot** — even one real quote ("the cleanest personal CRM I've seen — Anna, founder") is more powerful than any feature list. Leave the slot empty or mock until you collect one.
- **Live counter** ("8 demos started today") if you want a low-key activity signal.

### 7. Distribution mechanics

- **Open Graph polish per route** so every shared link previews well on LinkedIn / Twitter / iMessage.
- **Twitter / LinkedIn share buttons** on changelog entries and use-case pages with pre-filled copy.
- **Submit-to-directories prep**: a `/press` page with logo, screenshots, one-liner, founder bio, ready for Product Hunt / BetaList / Hacker News Show HN. Even if you don't launch on PH, having the assets ready unblocks it.
- **Friendly URLs** for sharing: `/demo`, `/for/job-seekers` (instead of `/use-cases/job-seekers`) — shorter, more memorable.

## Out of scope (intentionally)

- New CRM features (covered by a separate "smarter intel" plan if you want).
- Pricing / payments — this is a portfolio piece, free is the right default.
- Native mobile app.
- Real analytics dashboard for the user (PostHog/Plausible at the project level is enough; add this later).

## Suggested rollout

1. **`/demo` shareable route** — biggest single unlock; everything else amplifies it.
2. **SEO foundation** (Helmet, sitemap, robots, JSON-LD, polished OG image).
3. **`/about` + 3 use-case pages** with shared layout component.
4. **OG-per-route + share buttons** on landing, changelog, use-case pages.
5. **Interactive onboarding tour**.
6. **Public profile / shareable contact cards** (the most adventurous; ship last).

Each step is independently shippable — pause whenever you want to evaluate.

## Technical notes

- **Helmet**: install `react-helmet-async`, wrap `App` in `HelmetProvider`, remove `og:*` and `<title>` duplicates from `index.html` in favor of per-route Helmet (keep sitewide fallback in `index.html` for non-JS crawlers).
- **`/demo` data**: extract `seedContacts.json` into a typed in-memory store; React Query reads from it via a custom queryFn when the route prefix is `/demo`. No Supabase calls, no anonymous auth.
- **Use-case pages**: one shared `<MarketingPage>` layout (hero / problem / workflow / screenshot / CTA) parameterized by JSON or MDX content. Avoids a separate page per audience drifting visually.
- **Sitemap generator** in `scripts/generate-sitemap.ts`, wired to `predev` / `prebuild` per the head-meta convention.
- **OG image**: capture dashboard screenshot via browser tool, run product-shot skill with `sunset` or `peach` preset to match the maroon palette, save to `public/og-image.png`, reference at `https://orbitcrm.guptau.com/og-image.png`.
- **No new heavy deps**: all of this can be done with `react-helmet-async` + tsx (already used) + a small content JSON/MDX layer.
