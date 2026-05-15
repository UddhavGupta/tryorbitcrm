## Stability & polish audit

After reading through the app, here are the real bug-class issues I want to fix. Visual/feature work stays unchanged — this is purely correctness, safety, and resilience.

### 1. Timezone bugs (highest impact)

The app computes "today" as `new Date().toISOString().slice(0,10)` in many places. That's **UTC**, not the user's local date. For users west of UTC (e.g. US), reminders due "today" appear as "overdue" before midnight, birthdays jump a day, and `last_contacted_at` saved from a `<input type="date">` shifts back a day.

Fix:
- Add `src/lib/dates.ts` with `todayLocalISO()`, `dateOnlyToISO(d)`, and `parseDateOnly(d)` helpers.
- Replace every `new Date().toISOString().slice(0,10)` and `new Date(form.last_contacted_at).toISOString()` across `Dashboard.tsx`, `Reminders.tsx`, `People.tsx`, `Dates.tsx`, `ContactDialog.tsx`, `InteractionDialog.tsx`, `Timeline.tsx`.

### 2. Dangerous "Unload demo data" button

`Dashboard.tsx` shows **Unload demo data** whenever `totalContacts > 0` — for a real user with real data, one click wipes everything. No confirmation.

Fix: Only show the unload button if the current data actually came from the seed (e.g. matches sample emails) **or** wrap it in an `AlertDialog` with a typed-in confirmation. Simpler: only render it for anonymous demo sessions; everyone else gets sample data via `SampleDataButton` and can delete contacts manually.

### 3. Auth flow rough edges

- `Auth.tsx` signs out anonymous users inside an effect that re-runs on every `user` change — can briefly show the form, then redirect, then sign out, then show form again.
- `ProtectedRoute` redirects to `/` instead of `/auth`, losing the intended destination.
- After `signUp`, if email confirmation is on, no session is returned but we still `navigate("/app")` → ProtectedRoute bounces back. Show a "check your email" state instead.
- `AuthContext` sets `loading=false` from both the listener and `getSession()` — fine, but doesn't guard against an unmounted state update.

### 4. Reminder list — duplicate items on Dashboard

`reachOuts` merges `reminders` and `contacts.next_follow_up_date`. A contact with both shows twice. Dedupe by `contact.id` preferring the reminder row.

### 5. Timeline keys & sort stability

`<li key={\`${e.kind}-${idx}\`}>` uses array index — when toggling a reminder, React reuses checkboxes for the wrong item briefly. Switch to stable IDs (`reminder-${id}`, `interaction-${id}`, `birthday-${contactId}`, etc).

### 6. TagInput — case dedup and stale suggestions

- `allTags` aggregates raw strings, so "Mentor" and "mentor" appear as two suggestions. Normalize before deduping.
- After saving a contact with a new tag, the `["all-tags"]` query isn't invalidated. Invalidate it from `ContactDialog.save()`.

### 7. React Query defaults

`new QueryClient()` with no defaults — every navigation refetches and flickers. Set sensible defaults:
```ts
defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } }
```

### 8. ErrorBoundary scope

Currently wraps `<Routes>` only. A render error in `AuthProvider` or in providers above it kills the whole app with a blank screen. Move `<ErrorBoundary>` to the outermost spot (around `QueryClientProvider`) and keep a second one inside `<Routes>` so route errors don't take down the shell.

### 9. Silent query failures

Several `useQuery` callers ignore `error` (e.g. `openReminders`, `allTags`, `groups` on the reminders page). Add a small toast on error or surface a row banner so users know something failed instead of seeing empty data.

### 10. CSV import — large insert safety

`ImportCsvDialog` inserts up to 500 rows in one `insert`. Chunk into batches of 100, show a progress count, and roll back groups if contact insert fails partway. Also, when the same contact file is imported twice, we currently dupe — add a "skip if email matches existing" toggle (off by default, so behavior is unchanged for users who don't opt in).

### Out of scope

- New features (custom fields, birthday auto-reminders) — deferred from earlier plan.
- Visual redesign.
- Test suite — happy to add Vitest coverage in a follow-up if useful.

### Rollout order

1. Timezone helpers + replace usages (biggest correctness win).
2. Dashboard unload-demo guard + Auth/ProtectedRoute redirect fixes.
3. Dashboard reach-out dedupe + Timeline keys.
4. TagInput dedup + invalidation.
5. QueryClient defaults + ErrorBoundary move.
6. Silent error surfacing.
7. CSV chunking + dedupe option.

Each step is small and ships independently — no destructive migrations, no breaking changes.
