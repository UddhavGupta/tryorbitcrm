/**
 * Date helpers that work in the user's local timezone.
 *
 * Why this exists: `new Date().toISOString().slice(0,10)` returns the UTC date,
 * not the local date — so users west of UTC see "today" flip a day early and
 * date-only `<input type="date">` values shift by a day on save. These helpers
 * keep everything in local time.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Today as YYYY-MM-DD in the user's local timezone. */
export const todayLocalISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Convert a local Date to YYYY-MM-DD. */
export const dateToLocalISO = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Parse a YYYY-MM-DD value (e.g. from <input type="date">) as a local Date
 * at noon — avoids any DST/UTC shifting. Returns null for empty/invalid input.
 */
export const parseDateOnly = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Convert a YYYY-MM-DD form value to a full ISO string anchored at local noon,
 * so saving a "last contacted" date doesn't slip backward a day on storage.
 */
export const dateOnlyToISO = (value: string | null | undefined): string | null => {
  const d = parseDateOnly(value);
  return d ? d.toISOString() : null;
};
