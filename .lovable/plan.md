# Stability Hardening Plan

Based on the earlier audit, here are the concrete fixes grouped by impact. Scope is bug-fix and resilience only — no new features, no visual redesign.

## High impact

1. **Local-date helpers** — Add `src/lib/dates.ts` with `todayLocalISO()` and `formatLocalDate()`. Replace every `new Date().toISOString().slice(0,10)` (Reminders, Dashboard, ContactDetail, ContactDialog birthday compare) so reminders/birthdays are correct for users west of UTC.

2. **Guard "Unload demo data"** — In `Dashboard.tsx`, only show the unload button when the signed-in user actually has demo-tagged data; add a confirm dialog before deleting.

3. **Auth flow fixes**
   - `AuthContext`: track mounted ref, ignore late session updates after unmount.
   - `ProtectedRoute`: redirect unauthenticated users to `/auth` (not `/`).
   - `Auth.tsx`: stop auto-signing-out anonymous users in a re-running effect; do it once on mount.

4. **Dashboard reach-out dedupe** — Merge `reminders` and contacts' `next_follow_up_date` into a single keyed map so a contact with both doesn't appear twice.

## Medium impact

5. **Stable Timeline keys** — Use `${item.type}-${item.id}` instead of array index so checkbox state doesn't bind to the wrong row after reorder.

6. **TagInput correctness** — Case-insensitive duplicate check; invalidate `["all-tags"]` after `ContactDialog` save so suggestions refresh.

7. **QueryClient defaults** — Single shared client with `staleTime: 30_000`, `refetchOnWindowFocus: false`, `retry: 1`, and a global mutation `onError` that toasts.

8. **ErrorBoundary scope** — Wrap the whole `<App>` (outside providers) in addition to the inner one around `<Routes>`, so provider/auth crashes don't blank the screen.

## Lower impact (still worth doing)

9. **Surface silent query errors** — Add `onError` toasts (or check `error` and render an inline retry) on the queries in People, ContactDetail, Reminders, Groups, Dashboard.

10. **CSV import resilience** — Chunk inserts to ~100 rows, wrap each chunk in try/catch with per-chunk error reporting, and add a "skip duplicates by email" toggle.

## Out of scope
- New features (no new tables, no new pages)
- Visual redesign
- Test suite (can be a follow-up)

## Rollout order
1 → 7 → 8 → 3 → 2 → 4 → 5 → 6 → 9 → 10. Each step is independently shippable; verify the preview after steps 1, 3, and 7 since they touch the most surface area.
