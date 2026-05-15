# Performance & Polish Plan

Focus: faster initial load, fewer "blank flash" moments, smoother interactions. No new features, no redesign.

## Performance

1. **Route-level code splitting** — Convert all `src/pages/*` imports in `App.tsx` to `React.lazy()` and wrap `<Routes>` in `<Suspense>` with a lightweight fallback. Marketing pages (`Landing`, `About`, `Press`, `UseCase`, `Changelog`, `ProjectNotes`, `Demo`) are 200–600 LOC each and currently ship in the main bundle. Expected: meaningfully smaller first chunk for signed-in users.

2. **LCP image preload** — Add `<link rel="preload" as="image">` for the Landing hero logo in `index.html` and set explicit width/height + `fetchpriority="high"` on the hero `<img>`. Eliminates CLS and speeds up first paint.

3. **Hover prefetch for app nav** — On `NavLink` mouseenter, call `queryClient.prefetchQuery` for that route's primary query (People → contacts list, Reminders → open reminders, Dashboard → reminders-today). Makes nav feel instant.

4. **Memoize Dashboard derivations** — Wrap `reachOuts`, birthdays list, and cooling list in `useMemo` keyed on the source queries. Currently they recompute on every render including unrelated state changes.

## Polish (loading & motion)

5. **Skeleton screens everywhere a query renders** — Replace `Loader2` spinners with the existing `CardListSkeleton` / `RowListSkeleton` in `People`, `Reminders`, `Groups`, `Dates`, `ContactDetail`, and add a new `DashboardSkeleton` (4 stat cards + reach-out list shell) and `ContactDetailSkeleton` (avatar + meta + timeline shell).

6. **Page enter animation** — Add `animate-fade-in` (already in tailwind config) to the `AppLayout` content wrapper so route changes feel intentional rather than abrupt.

7. **Subtle list stagger** — On reach-outs, contact cards, and timeline rows, apply incremental `animation-delay` (0–200ms across first ~10 items) using inline style. Adds polish without library cost.

8. **Empty-state warmth** — Audit `InlineEmpty` callers; ensure each has a primary action button (Reminders empty → "Create your first reminder", etc.). A few currently render text-only.

9. **Confirm dialog for destructive actions** — Replace remaining `window.confirm` calls (delete contact / reminder / group) with the project's `AlertDialog`. Consistent visual + keyboard handling.

## Out of scope
- New features, redesign, dark-mode rework
- Backend or RLS changes
- Test suite

## Rollout order
1 → 2 → 5 → 6 → 4 → 3 → 7 → 8 → 9. Verify preview after step 1 (Suspense edge cases) and step 5 (visual diff across pages).
