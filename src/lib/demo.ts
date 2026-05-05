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

export async function seedDemo(userId: string) {
  // Clear existing data for this user (anonymous demo session)
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

  // Insert contacts
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
    cooling_days: 30,
  }));
  const { data: contacts } = await supabase.from("contacts").insert(contactsPayload).select();

  if (!contacts) return;

  // Group memberships
  const cgPayload = contacts
    .map((c, i) => {
      const groupName = rows[i].group;
      const gid = groupName ? groupByName.get(groupName) : null;
      if (!gid) return null;
      return { contact_id: c.id, group_id: gid, user_id: userId };
    })
    .filter(Boolean) as any[];
  if (cgPayload.length) await supabase.from("contact_groups").insert(cgPayload);

  // Reminders — pull from next_follow_up_date when present, prioritize today/overdue
  const today = new Date().toISOString().slice(0, 10);
  const reminders = contacts
    .map((c, i) => {
      if (!rows[i].next_follow_up_date) return null;
      return {
        user_id: userId,
        contact_id: c.id,
        title: `Follow up with ${rows[i].first_name}`,
        due_date: rows[i].next_follow_up_date,
        priority: rows[i].priority,
        completed: false,
      };
    })
    .filter(Boolean)
    .slice(0, 12) as any[];
  // Force a couple to be due today for a lively dashboard
  if (reminders[0]) reminders[0].due_date = today;
  if (reminders[1]) reminders[1].due_date = today;
  if (reminders.length) await supabase.from("reminders").insert(reminders);

  // A few sample interactions on the first handful of contacts
  const sampleInteractions = contacts.slice(0, 6).map((c, i) => {
    const daysAgo = [3, 10, 21, 5, 45, 14][i];
    const occurred = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const kinds = ["meeting", "email", "call", "text", "note", "intro"];
    return {
      user_id: userId,
      contact_id: c.id,
      kind: kinds[i],
      note: rows[i].notes ?? `Caught up with ${rows[i].first_name}.`,
      occurred_at: occurred,
    };
  });
  await supabase.from("interactions").insert(sampleInteractions);
}
