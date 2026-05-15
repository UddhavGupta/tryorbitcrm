# Track 1 Continued — Bulk Actions + Inline Edit

Make People feel like a real CRM workbench: select many, change fields without opening a dialog.

## Bulk actions on People

- **Selection model**
  - Checkbox in the top-left corner of each contact card (visible on hover, persistent when selected)
  - Header-level "Select all visible" / "Clear" once any item is selected
  - Selection survives filter changes but is cleared on search-text change to avoid surprises
- **Bulk action bar** (sticky at the bottom of the viewport when ≥1 selected)
  - Count: "3 selected"
  - Actions:
    - **Add to group** — popover with group list + "New group…"
    - **Add tag** — small text input that creates/uses tags
    - **Set priority** — High / Medium / Low
    - **Mark contacted today** — bulk update `last_contacted_at`
    - **Delete** — AlertDialog confirm, deletes all selected
  - "Clear selection" button on the right
- **Implementation notes**
  - All updates batched via a single `.in("id", ids)` Supabase call per action
  - For "Add to group": insert N rows into `contact_groups` (skip duplicates client-side using existing memberships)
  - Optimistic UI not required — invalidate `["contacts"]` after success and toast result

## Inline edit on contact cards (lightweight)

- **Quick edit menu** on each card: kebab (⋯) button next to the existing "Mark contacted" button
  - Set priority (High/Med/Low) — instant update
  - Snooze cooling threshold (+15 / +30 / +60 days) — bumps `cooling_days`
  - "Edit details…" → opens existing ContactDialog
- Keeps the card a Link; menu uses `data-stop` pattern to avoid navigation

## Inline edit on Contact Detail page

- **Click-to-edit** on these fields (no full dialog):
  - Title, Company, City, Email, Phone, LinkedIn URL, Why this person matters
  - UI: text shows as plain by default; click → input with Save/Cancel; Enter saves, Esc cancels
  - Validates with Zod: email format, URL format, max lengths (255 for short fields, 2000 for `why_matters`)
- **Tags**: existing TagInput becomes always-on (already inline in dialog; mirror it on detail)
- Each save calls `.update({...}).eq("id", id)` and invalidates `["contact", id]`

## Out of scope this pass

- Drag-to-reorder, multi-row table view, CSV export of selection, undo for bulk delete (we'll rely on the AlertDialog confirm).
- Inline edit of `name`/`last_name` on the detail page header (riskier identity field — keep dialog-only for now).

## Technical notes

- New file `src/components/BulkActionBar.tsx` — sticky bottom bar, takes `selectedIds`, `contacts`, `groups`, callbacks
- New hook `src/hooks/useSelection.ts` — `Set<string>` state with `toggle`, `selectAll`, `clear`, `has`
- New file `src/components/InlineField.tsx` — generic click-to-edit text/textarea with Zod schema prop
- People.tsx wires checkboxes + the kebab menu (uses existing `DropdownMenu`)
- ContactDetail.tsx swaps static field renders for `<InlineField>`
- All inputs validated with Zod, server protected by existing RLS

## Rollout order

1. `useSelection` hook + checkbox UI on People cards
2. `BulkActionBar` with all 5 actions
3. Card-level kebab quick edits (priority, cooling)
4. `InlineField` component + ContactDetail rewiring
5. QA pass: keyboard shortcuts still work; empty/loading states unaffected