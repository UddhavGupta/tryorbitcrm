import { addDays, nextDay, type Day } from "date-fns";
import { dateToLocalISO, todayLocalISO } from "@/lib/dates";

const DAYS: Record<string, Day> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

/**
 * Parse a free-form reminder string into { title, due_date }.
 * Supports trailing patterns like:
 *   "Call Sarah tomorrow"
 *   "Email Pat in 3 days"
 *   "Coffee with Sam next monday"
 *   "Wish Alex on friday"
 * Falls back to today if no date phrase is found.
 */
export function parseQuickReminder(input: string): { title: string; due_date: string } {
  const trimmed = input.trim();
  const today = new Date();
  const todayStr = todayLocalISO();

  const patterns: { re: RegExp; date: (m: RegExpMatchArray) => string }[] = [
    { re: /\s+today\.?$/i, date: () => todayStr },
    { re: /\s+tomorrow\.?$/i, date: () => dateToLocalISO(addDays(today, 1)) },
    { re: /\s+in\s+(\d{1,3})\s+days?\.?$/i, date: (m) => dateToLocalISO(addDays(today, parseInt(m[1], 10))) },
    { re: /\s+in\s+a\s+week\.?$/i, date: () => dateToLocalISO(addDays(today, 7)) },
    { re: /\s+in\s+(\d{1,2})\s+weeks?\.?$/i, date: (m) => dateToLocalISO(addDays(today, parseInt(m[1], 10) * 7)) },
    { re: /\s+next\s+week\.?$/i, date: () => dateToLocalISO(addDays(today, 7)) },
    {
      re: /\s+(?:on\s+|next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)\.?$/i,
      date: (m) => {
        const day = DAYS[m[1].toLowerCase()];
        return dateToLocalISO(nextDay(today, day));
      },
    },
  ];

  for (const p of patterns) {
    const m = trimmed.match(p.re);
    if (m) {
      const title = trimmed.slice(0, m.index).trim().replace(/[,;:\-]+$/, "").trim();
      return { title: title || trimmed, due_date: p.date(m) };
    }
  }

  return { title: trimmed, due_date: todayStr };
}
