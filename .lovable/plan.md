# Make Orbit Better — Multi-Track Plan

You picked all four tracks. To avoid a sprawling, half-done sweep, I'll do one focused pass per track with the highest-leverage wins, then we can iterate.

## Track 1 — Core CRM UX (People & Reminders)

Goal: make daily use feel fast and keyboard-friendly.

- **Smarter People search/filter bar**
  - Single search box matches name, company, email, tags
  - Filter chips: Priority (high/med/low), Group, Cooling, Has birthday this month
  - Sort: Recently contacted, Name, Cooling risk
  - Persist filters in URL query params so refreshes/back-button work
- **Bulk actions on People**
  - Row checkboxes + "Select all on page"
  - Bulk: add to group, add tag, set priority, delete (with AlertDialog)
- **Inline quick actions**
  - Hover row → quick "Log interaction" / "Snooze reminder" buttons
  - "Mark contacted today" one-click on each row (updates `last_contacted_at`)
- **Reminders upgrades**
  - Group by Overdue / Today / This week / Later
  - Snooze menu (1d, 3d, 1w, custom)
  - Quick-add input at top: "Call Sarah tomorrow" → parses date heuristically
- **Keyboard shortcuts**
  - `/` focus search, `n` new contact, `r` new reminder, `g p` go to People, `g r` go to Reminders, `?` help overlay

## Track 2 — Landing & marketing polish

Goal: the homepage should feel like a premium product, not a template.

- Tighten hero: stronger headline, single primary CTA + ghost "See live demo"
- Add real social proof band (logos placeholder + 2–3 short testimonials)
- New "How it works" 3-step section with mini illustrations
- Replace generic screenshot block with annotated product shots (Dashboard, Contact detail, Reminders)
- Sticky compact nav after scroll; smooth anchor scrolling
- Footer cleanup: group links, add changelog + status

## Track 3 — Visual polish pass

Scoped to highest-impact surfaces, using design directions so you choose the look:

- Dashboard summary cards (3 directions)
- Contact detail header (3 directions)
- Landing hero (3 directions)

For each, I'll generate options via the design-directions tool and you pick one before I implement. No global redesign — semantic tokens only, existing palette preserved.

## Track 4 — Smarter relationship intel

- **Better cooling detection**
  - Use per-contact `cooling_days` already in schema (default 30) instead of a global threshold
  - Severity tiers: Warming (80% of window), Cooling (100%), Cold (150%+)
  - Surface on Dashboard + a dedicated "Needs attention" filter on People
- **AI follow-up draft (Lovable AI Gateway, no key needed)**
  - On Contact detail: "Draft follow-up" button → calls edge function with contact context (name, company, last interaction note, why_matters) → returns 2 short message options (email + casual text)
  - Copy-to-clipboard, no auto-send
  - Model: `google/gemini-2.5-flash` (fast, cheap, good enough)
- **Weekly digest view**
  - New `/digest` route: top 5 reach-outs this week, upcoming birthdays/anniversaries (next 14d), cooling list, recent wins (interactions logged last 7d)
  - Link from Dashboard; print-friendly layout

## Technical notes

- New edge function: `draft-followup` using `LOVABLE_API_KEY` + Lovable AI Gateway, `verify_jwt = true`
- No schema changes required for tracks 1–3
- Track 4 uses existing `cooling_days`, `last_contacted_at`, `interactions`, `why_matters` — no migration needed
- URL-state for filters via `useSearchParams`
- Keyboard shortcuts via a small `useHotkeys` hook (no new dep)

## Suggested rollout order

1. Track 1 (biggest daily-use payoff)
2. Track 4 cooling tiers + digest (uses existing data)
3. Track 2 landing polish
4. Track 3 visual directions (interactive — needs your picks)
5. Track 4 AI follow-up draft

## Out of scope

- Mobile app, dark mode toggle, team/multi-user, billing, email sending, calendar sync, new auth providers.

If this is too much for one go, tell me which track to do first and I'll ship just that.