// Deterministic tag color from a fixed palette (HSL design tokens not available
// for arbitrary user strings, so we use a fixed Tailwind-friendly palette).
const PALETTE = [
  { bg: "bg-violet-100 dark:bg-violet-500/15", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-500/30" },
  { bg: "bg-emerald-100 dark:bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-500/30" },
  { bg: "bg-amber-100 dark:bg-amber-500/15", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-500/30" },
  { bg: "bg-sky-100 dark:bg-sky-500/15", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-500/30" },
  { bg: "bg-pink-100 dark:bg-pink-500/15", text: "text-pink-700 dark:text-pink-300", border: "border-pink-200 dark:border-pink-500/30" },
  { bg: "bg-teal-100 dark:bg-teal-500/15", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-500/30" },
  { bg: "bg-indigo-100 dark:bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-500/30" },
  { bg: "bg-rose-100 dark:bg-rose-500/15", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-500/30" },
];

export function normalizeTag(s: string) {
  return s.trim().replace(/\s+/g, " ").slice(0, 32);
}

export function tagColor(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function tagClasses(tag: string) {
  const c = tagColor(tag);
  return `${c.bg} ${c.text} border ${c.border}`;
}
