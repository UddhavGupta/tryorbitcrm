# More CRM features

Four additions, each independently shippable. Only DB change is a `tags` column on `contacts` and a settings field for birthday lead-time.

## 1. Tags (free-form labels)

Per-contact, in addition to groups. Lighter weight — no separate page, just colored chips on the card.

- **Schema**: `contacts.tags TEXT[] NOT NULL DEFAULT '{}'`. GIN index for filtering.
- **Edit**: in `ContactDialog`, a tag input with comma/Enter to add, Backspace to remove last. Suggests existing tags from the user's other contacts.
- **Display**: small pill row on contact cards (People page) and contact detail header. Color derived deterministically from tag string.
- **Filter**: tag picker in the People filters popover. Multi-select; matches contacts that have ALL selected tags.

## 2. Contact timeline

Unified chronological view on the contact detail page, replacing the two stacked "Interaction history" + "Reminders" lists.

- New `Timeline` section with merged events sorted by date desc:
  - Interactions (from `interactions`)
  - Reminders (due / completed events from `reminders`)
  - Lifecycle: contact created, last_contacted_at changes (from contact metadata, no new table)
  - Upcoming: birthday / anniversary entries shown at their dates within ±90 days
- Each row has icon, label, relative date, and inline actions (edit/delete) where applicable.
- Keep the existing add buttons ("Log interaction", "New reminder") above the timeline.
- Old separate sections collapse into one. No DB changes.

## 3. Birthday & anniversary auto-reminders

A daily background job that creates reminders N days before each contact's birthday or anniversary, deduped so it never creates twice.

- **Settings**: extend `profiles` with `birthday_lead_days INT DEFAULT 7` and `birthday_reminders_enabled BOOL DEFAULT true`. Tiny settings card on Dashboard or new `/app/settings` page (pick one — recommend Dashboard collapsible).
- **Edge function** `birthday-reminders`: for each user with the flag on, find contacts whose `birthday` or `anniversary` (month/day) lands within the next `lead_days`. Insert a reminder with title `"🎂 {name}'s birthday on {date}"` if no open reminder with that title already exists.
- **Schedule**: pg_cron job runs the function once a day at 8am UTC.
- **Manual trigger**: a "Generate now" button in settings for testing.

## 4. Custom fields

Per-user-defined fields applied to all contacts. Stored as JSONB to avoid a schema migration per field.

- **Schema**:
  - `contacts.custom JSONB NOT NULL DEFAULT '{}'`
  - New table `custom_field_defs (id, user_id, key, label, type, position)` where type ∈ `text | longtext | url | date | number`. RLS on user_id.
- **Settings UI** (new `/app/settings` route, or modal from UserMenu): list/add/reorder/delete custom field definitions. Max 12 fields per user.
- **Contact dialog**: render dynamic inputs after the standard fields, grouped under "Custom".
- **Contact detail**: render filled custom fields as a labeled definition list in the sidebar.
- **Filtering / search**: out of scope for v1.

## Out of scope

- LinkedIn enrichment (needs API key + adds external dependency — separate ask)
- Tag colors editable per tag (auto-generated only)
- Custom field validation rules beyond type
- Per-tag pages

## Rollout order

1. Tags (small, high value, single migration)
2. Timeline (no DB changes, pure refactor of contact detail)
3. Birthday auto-reminders (settings + edge function + cron — needs user to confirm cron schedule)
4. Custom fields (new table + settings page — biggest scope)

Ship 1+2 first, then 3, then 4. I'll start with #1 once approved.

## Technical notes

- Tag color: hash tag string → pick from a fixed 8-color palette in design tokens.
- Timeline events: build in a `useMemo` from existing queries; no extra query.
- Edge function uses service role key (already configured) and iterates over users with reminders enabled.
- Custom field keys are slugified (`a-z0-9_`) and unique per user.
