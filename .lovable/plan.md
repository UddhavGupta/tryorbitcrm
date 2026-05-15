## 1. Explicit "Favorite" toggle on contact cards

**Where**: top-right corner of each card on `src/pages/People.tsx` (inside the existing card link, absolutely positioned at `top-3 right-3`).

**Control**: a star icon button (lucide `Star`).
- Filled gold when the contact is a favorite, outlined gray when not.
- Always visible (not hover-only) so it's discoverable.
- `e.preventDefault() + e.stopPropagation()` so clicking it doesn't navigate into the contact.
- Tooltip: "Mark as favorite" / "Remove favorite".

**Data model**: reuse the existing `contacts.priority` field — `priority === "high"` = favorite. No schema change needed. Toggling the star calls the existing `quickUpdate(c.id, { priority: isFav ? "medium" : "high" })` helper that's already in People.tsx.
- Keeps the existing "High / Medium / Low" priority dropdown working unchanged.
- The existing tiny "high" pill in the card header becomes redundant, so the star replaces it visually (we'll hide the pill when `priority === "high"` since the star already communicates it; the "low" pill stays).

**Mirror on detail page**: `src/pages/ContactDetail.tsx` header — add the same star button next to the Edit/Delete row (top-right of the profile card) so the affordance is consistent.

## 2. Notes always visible + helpful empty-state hint

**Where**: the existing "Notes" card on `src/pages/ContactDetail.tsx` (lines 263–276) and the "Why they matter" card right above it.

**Behavior changes**:
- Notes are already rendered via `InlineField` with `multiline`. We'll keep that, but:
  - Replace the current empty-state label ("Add notes") with a multi-line light-gray example block:
    > _e.g. partner's name, pet's name, university, likes/dislikes, favorite restaurant or wine…_
  - Use `text-muted-foreground/70 italic` for the placeholder so it reads as a hint, not a value.
  - Clicking the placeholder opens the editor (already the InlineField behavior); the textarea's own `placeholder` attr will mirror the same examples so the user sees them while typing the first time.
- Make sure the full notes value renders with `whitespace-pre-wrap` (already true) so multi-line notes are fully visible — no truncation, no "show more". This satisfies "see all notes."

**Small InlineField tweak**: `src/components/InlineField.tsx` already supports `emptyLabel` and `placeholder`. We'll pass:
- `emptyLabel`: the example sentence.
- `placeholder` (textarea): same examples.
- Add an optional `emptyClassName` prop (or just style via existing classes) so the empty-state text renders italic + lighter gray. If the component doesn't expose styling for the empty label, we'll add a small `emptyClassName?: string` prop and thread it through — purely additive, no behavior change for other call sites.

## Out of scope
- No new database column (favorite reuses `priority`).
- No changes to the Priority filter, sort, or bulk actions — they keep working off `priority`.
- No redesign of the card layout beyond moving/swapping the corner badge.
- No changes to "Why they matter" copy (already has its own prompt).

## Files touched
- `src/pages/People.tsx` — add star button top-right of card; hide redundant "high" pill.
- `src/pages/ContactDetail.tsx` — add star button in profile header; update Notes `emptyLabel` + placeholder with examples; apply muted/italic styling.
- `src/components/InlineField.tsx` — add optional `emptyClassName` prop (only if needed to style the empty-state text).
