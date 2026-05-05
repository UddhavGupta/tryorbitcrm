import { differenceInDays, parseISO } from "date-fns";

export type RelationshipStatus = "active" | "warming" | "cooling" | "cold" | "unknown";
export type SuggestedAction =
  | "follow_up_today"
  | "overdue_follow_up"
  | "reconnect_soon"
  | "send_birthday_note"
  | "no_action";

export const INTEL_DISCLAIMER =
  "Suggestions are rule-based and generated from your contact data. No external AI is used in this version.";

export function getRelationshipStatus(lastContactedAt?: string | null): RelationshipStatus {
  if (!lastContactedAt) return "unknown";
  const days = differenceInDays(new Date(), parseISO(lastContactedAt));
  if (days <= 30) return "active";
  if (days <= 60) return "warming";
  if (days <= 90) return "cooling";
  return "cold";
}

export const STATUS_LABEL: Record<RelationshipStatus, string> = {
  active: "Active",
  warming: "Warming",
  cooling: "Cooling",
  cold: "Cold",
  unknown: "No history",
};

// Subtle, neutral-leaning palette. No maroon for status.
export const STATUS_CLASSES: Record<RelationshipStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  warming: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  cooling: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  cold: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  unknown: "bg-secondary text-muted-foreground border-border",
};

function daysUntilNextBirthday(birthday?: string | null): number | null {
  if (!birthday) return null;
  const b = parseISO(birthday);
  const today = new Date();
  let next = new Date(today.getFullYear(), b.getMonth(), b.getDate());
  if (next.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
    next = new Date(today.getFullYear() + 1, b.getMonth(), b.getDate());
  }
  return differenceInDays(next, today);
}

export type IntelInput = {
  priority?: string | null;
  last_contacted_at?: string | null;
  birthday?: string | null;
  /** Earliest open reminder due date (yyyy-mm-dd). */
  nextOpenReminderDue?: string | null;
};

export function getSuggestedAction(c: IntelInput): SuggestedAction {
  const todayStr = new Date().toISOString().slice(0, 10);
  const due = c.nextOpenReminderDue ?? null;

  if (due && due < todayStr) return "overdue_follow_up";
  if (due && due === todayStr) return "follow_up_today";

  const status = getRelationshipStatus(c.last_contacted_at);
  if ((c.priority ?? "medium") === "high" && (status === "cooling" || status === "cold")) {
    return "reconnect_soon";
  }

  const dToBday = daysUntilNextBirthday(c.birthday);
  if (dToBday !== null && dToBday >= 0 && dToBday <= 7) return "send_birthday_note";

  return "no_action";
}

export const ACTION_LABEL: Record<SuggestedAction, string> = {
  follow_up_today: "Follow up today",
  overdue_follow_up: "Overdue follow-up",
  reconnect_soon: "Reconnect soon",
  send_birthday_note: "Send birthday note",
  no_action: "No action needed",
};

// Maroon (primary) reserved for important actions; soft tones otherwise.
export const ACTION_CLASSES: Record<SuggestedAction, string> = {
  overdue_follow_up: "bg-primary/10 text-primary border-primary/20",
  follow_up_today: "bg-primary/10 text-primary border-primary/20",
  reconnect_soon: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  send_birthday_note: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
  no_action: "bg-secondary text-muted-foreground border-border",
};
