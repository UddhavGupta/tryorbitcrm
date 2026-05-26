import { supabase } from "@/integrations/supabase/client";
import SEED from "./seedContacts.json";

type SeedRow = {
  first_name: string;
  last_name: string | null;
  title: string | null;
  company: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  group: string | null;
  priority: string;
  last_contacted_at: string | null;
  next_follow_up_date: string | null;
  birthday: string | null;
  notes: string | null;
};

const GROUP_COLORS = [
  "#a78bfa", "#34d399", "#fb923c", "#60a5fa", "#f472b6",
  "#facc15", "#22d3ee", "#fb7185", "#4ade80", "#c084fc",
  "#fcd34d", "#7dd3fc", "#fda4af", "#a3e635", "#f97316",
  "#818cf8", "#2dd4bf", "#e879f9", "#84cc16", "#0ea5e9",
  "#ef4444", "#10b981", "#8b5cf6",
];

const INTERACTION_KINDS = ["meeting", "email", "call", "text", "note", "intro"];

// Tag library — keyed by group so demo contacts feel coherent.
const GROUP_TAGS: Record<string, string[]> = {
  "Alumni": ["kellogg", "mba-network", "warm"],
  "Founders": ["founder", "early-stage", "intro-worthy"],
  "PE/VC": ["investor", "fintech", "thesis-aligned"],
  "Operators": ["operator", "ops-leader"],
  "Design": ["design", "research"],
  "Growth": ["growth", "activation"],
  "Product": ["product", "platform"],
  "Students": ["kellogg", "mba-network", "classmate"],
  "Recruiting": ["recruiter", "hiring", "opportunity"],
  "DevTools": ["engineering", "devtools"],
  "Marketing": ["marketing", "launch"],
  "RevOps": ["revops", "gtm"],
  "Partnerships": ["partnerships"],
  "Product Ops": ["product-ops"],
  "BizOps": ["bizops"],
  "CX": ["customer", "retention"],
  "PMM": ["pmm", "launch"],
  "Analytics": ["analytics", "data"],
  "Sales": ["sales", "ae"],
  "Strategy": ["strategy", "mba-network"],
  "BizDev": ["bizdev", "partnerships"],
  "Community": ["community", "events"],
};

const BRIEF_TOPICS = [
  ["recent product launch", "hiring plans"],
  ["fundraising thoughts", "GTM motion"],
  ["team scaling", "career transitions"],
  ["AI workflow tooling", "customer research insights"],
  ["fintech regulations", "platform strategy"],
];

const OPEN_LOOPS = [
  "Owe them a warm intro to a designer",
  "Promised to share the OrbitCRM demo",
  "Said I'd send over a podcast recommendation",
  "Need to circle back on the role they mentioned",
  "Asked for feedback on their landing page draft",
];

const NEXT_STEPS = [
  "Send a short check-in note this week and ask about their recent launch.",
  "Reply to their last thread and propose a 20-minute virtual coffee.",
  "Share an article that connects to what they're working on right now.",
  "Forward an intro that helps them with the open role they mentioned.",
  "Suggest grabbing coffee next time you're in the same city.",
];

const FOLLOWUP_DRAFTS = [
  "Hey {first} — been a minute. Saw your update about {company} and wanted to say it looks great. Any chance you have 20 minutes next week to catch up?",
  "{first}, hope you're doing well. I've been thinking about our last conversation on {topic}. Free for a quick call?",
  "Hi {first} — wanted to reconnect. I have a small thing you might find interesting at {company}. Pick a time that works?",
];

// Deterministic helpers so generated demo data is stable per run/contact
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const pick = <T,>(arr: T[], seed: string) => arr[hash(seed) % arr.length];

function buildBriefContent(c: any, r: SeedRow) {
  const first = r.first_name;
  const company = r.company ?? "their company";
  const group = r.group ?? "your network";
  const topicPair = pick(BRIEF_TOPICS, c.id + "topic");
  const openLoop = pick(OPEN_LOOPS, c.id + "loop");
  const nextStep = pick(NEXT_STEPS, c.id + "next");
  const lastInteractionLabel = r.last_contacted_at
    ? `Last spoke on ${new Date(r.last_contacted_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} — ${pick(["a quick check-in", "a working session", "a casual catch-up", "an intro call"], c.id + "li")}.`
    : "No interaction logged yet.";

  return {
    summary: `${first} is a ${r.title?.toLowerCase() ?? "key contact"} at ${company} and a ${r.priority === "high" ? "high-priority" : r.priority === "low" ? "low-touch" : "steady"} relationship in your ${group.toLowerCase()} circle.`,
    how_i_know: `Connected through the ${group} circle. ${r.notes ?? `${first} works at ${company}.`}`,
    last_interaction: lastInteractionLabel,
    key_details: [
      `${first} works at ${company}${r.city ? ` (${r.city})` : ""}.`,
      `Tagged: ${(GROUP_TAGS[group] ?? [group.toLowerCase()]).slice(0, 3).join(", ")}.`,
      `Birthday on ${r.birthday ? new Date(r.birthday).toLocaleDateString(undefined, { month: "long", day: "numeric" }) : "—"}.`,
    ],
    recent_topics: topicPair,
    open_loops: [openLoop],
    suggested_next_step: nextStep,
    suggested_followup_timing: r.next_follow_up_date
      ? `Reach out by ${new Date(r.next_follow_up_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}.`
      : "Within the next 2 weeks.",
    draft_message: pick(FOLLOWUP_DRAFTS, c.id + "draft")
      .replace("{first}", first)
      .replace("{company}", company)
      .replace("{topic}", topicPair[0]),
  };
}

export async function seedDemo(
  userId: string,
  opts: { requireAnonymous?: boolean } = {},
) {
  // Safety: verify the userId matches the active session, and (optionally)
  // that the session is anonymous. seedDemo destructively wipes contacts,
  // groups, reminders, and interactions — never run it against the wrong user.
  const { data: sess } = await supabase.auth.getUser();
  const current = sess.user;
  if (!current || current.id !== userId) {
    throw new Error("Refusing to seed demo data: session does not match target user.");
  }
  const isAnon =
    (current as any).is_anonymous === true ||
    (current.app_metadata as any)?.provider === "anonymous";
  if (opts.requireAnonymous && !isAnon) {
    throw new Error("Refusing to seed demo data onto a non-anonymous account.");
  }

  // Clear existing data for this user
  await supabase.from("relationship_briefs").delete().eq("user_id", userId);
  await supabase.from("reminders").delete().eq("user_id", userId);
  await supabase.from("interactions").delete().eq("user_id", userId);
  await supabase.from("contact_groups").delete().eq("user_id", userId);
  await supabase.from("contacts").delete().eq("user_id", userId);
  await supabase.from("groups").delete().eq("user_id", userId);

  const rows = SEED as SeedRow[];

  // Build group palette from CSV
  const groupNames = Array.from(new Set(rows.map((r) => r.group).filter(Boolean))) as string[];
  const groupsPayload = groupNames.map((name, i) => ({
    user_id: userId,
    name,
    color: GROUP_COLORS[i % GROUP_COLORS.length],
  }));
  const { data: groups } = await supabase.from("groups").insert(groupsPayload).select();
  const groupByName = new Map((groups ?? []).map((g: any) => [g.name, g.id]));

  // Build "why they matter" per row from notes + group context.
  const buildWhy = (r: SeedRow) => {
    const group = r.group ?? "your network";
    if (r.notes) return `${r.notes} Worth keeping warm because of the ${group.toLowerCase()} connection.`;
    return `A ${r.priority === "high" ? "high-priority" : "steady"} relationship from your ${group.toLowerCase()} circle.`;
  };

  // Insert contacts (with why_matters and tags pulled from group)
  const contactsPayload = rows.map((r) => ({
    user_id: userId,
    name: r.first_name,
    last_name: r.last_name,
    title: r.title,
    company: r.company,
    city: r.city,
    email: r.email,
    phone: r.phone,
    linkedin_url: r.linkedin_url,
    priority: r.priority,
    last_contacted_at: r.last_contacted_at ? new Date(r.last_contacted_at).toISOString() : null,
    next_follow_up_date: r.next_follow_up_date,
    birthday: r.birthday,
    notes: r.notes,
    why_matters: buildWhy(r),
    tags: GROUP_TAGS[r.group ?? ""] ?? (r.group ? [r.group.toLowerCase()] : []),
    cooling_days: 30,
  }));
  const { data: contacts } = await supabase.from("contacts").insert(contactsPayload).select();

  if (!contacts) return;

  // Group memberships — match by name+last_name+company rather than array index,
  // since Supabase doesn't guarantee returned row order matches input order.
  const contactByKey = new Map<string, string>(
    (contacts as any[]).map((c) => [
      `${c.name ?? ""}|${c.last_name ?? ""}|${c.company ?? ""}`,
      c.id,
    ]),
  );
  const rowByContactId = new Map<string, SeedRow>();
  contacts.forEach((c: any) => {
    const r = rows.find(
      (rr) => rr.first_name === c.name && (rr.last_name ?? null) === (c.last_name ?? null) && (rr.company ?? null) === (c.company ?? null),
    );
    if (r) rowByContactId.set(c.id, r);
  });

  const cgPayload = rows
    .map((r) => {
      const gid = r.group ? groupByName.get(r.group) : null;
      const cid = contactByKey.get(
        `${r.first_name}|${r.last_name ?? ""}|${r.company ?? ""}`,
      );
      if (!gid || !cid) return null;
      return { contact_id: cid, group_id: gid, user_id: userId };
    })
    .filter(Boolean) as any[];
  if (cgPayload.length) await supabase.from("contact_groups").insert(cgPayload);

  // Reminders — pull from next_follow_up_date when present, prioritize today/overdue
  const today = new Date().toISOString().slice(0, 10);
  const reminders = contacts
    .map((c: any) => {
      const r = rowByContactId.get(c.id);
      if (!r?.next_follow_up_date) return null;
      return {
        user_id: userId,
        contact_id: c.id,
        title: `Follow up with ${r.first_name}`,
        due_date: r.next_follow_up_date,
        priority: r.priority,
        completed: false,
      };
    })
    .filter(Boolean) as any[];
  // Force a couple to be due today / overdue for a lively dashboard
  if (reminders[0]) reminders[0].due_date = today;
  if (reminders[1]) reminders[1].due_date = today;
  if (reminders[2]) {
    const past = new Date(); past.setDate(past.getDate() - 4);
    reminders[2].due_date = past.toISOString().slice(0, 10);
    reminders[2].priority = "high";
  }
  if (reminders.length) await supabase.from("reminders").insert(reminders);

  // Sample interactions: 2–3 per contact for the first 24 contacts so timelines feel rich.
  const interactionsPayload: any[] = [];
  contacts.slice(0, 24).forEach((c: any, idx: number) => {
    const r = rowByContactId.get(c.id);
    if (!r) return;
    const baseDaysAgo = [3, 10, 21, 5, 45, 14, 7, 30][idx % 8];
    const count = (idx % 3) + 2; // 2 or 3 interactions
    for (let k = 0; k < count; k++) {
      const daysAgo = baseDaysAgo + k * 12;
      interactionsPayload.push({
        user_id: userId,
        contact_id: c.id,
        kind: INTERACTION_KINDS[(idx + k) % INTERACTION_KINDS.length],
        note: k === 0
          ? (r.notes ?? `Caught up with ${r.first_name}.`)
          : pick([
              `Talked through ${pick(BRIEF_TOPICS, c.id + k)[0]}. They sounded energized.`,
              `Quick exchange — they mentioned wanting an intro to someone in design.`,
              `Shared notes on a recent launch. ${r.first_name} had sharp feedback.`,
              `Casual check-in before their trip. They flagged a follow-up topic.`,
            ], c.id + "i" + k),
        next_steps: k === 0 ? "Send the resource we discussed." : null,
        occurred_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      });
    }
  });
  if (interactionsPayload.length) await supabase.from("interactions").insert(interactionsPayload);

  // Pre-generated demo Relationship Briefs for ALL contacts.
  const briefsPayload = contacts.map((c: any) => {
    const r = rowByContactId.get(c.id);
    if (!r) return null;
    return {
      user_id: userId,
      contact_id: c.id,
      content: buildBriefContent(c, r),
      edited: false,
      model: "demo-seed",
    };
  }).filter(Boolean) as any[];
  if (briefsPayload.length) await supabase.from("relationship_briefs").insert(briefsPayload);
}
