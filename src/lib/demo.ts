import { supabase } from "@/integrations/supabase/client";

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  notes: string | null;
  birthday: string | null;
  anniversary: string | null;
  last_contacted_at: string | null;
  cooling_days: number;
  avatar_url: string | null;
};

export type Group = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
};

export type Reminder = {
  id: string;
  user_id: string;
  contact_id: string | null;
  title: string;
  due_date: string;
  completed: boolean;
};

export type Interaction = {
  id: string;
  user_id: string;
  contact_id: string;
  kind: string;
  note: string | null;
  occurred_at: string;
};

const SAMPLE = [
  { name: "Maya Chen", title: "Product Designer", company: "Linear", city: "San Francisco", email: "maya@example.com", birthday: "1995-05-12", cooling_days: 21, notes: "Met at Config 2024. Loves bouldering." },
  { name: "Jordan Patel", title: "Founder", company: "Tideflow", city: "London", email: "jordan@example.com", birthday: "1990-07-04", cooling_days: 14, notes: "Intro from Sam. Talk hiring." },
  { name: "Sofia Rossi", title: "Engineering Manager", company: "Vercel", city: "Berlin", email: "sofia@example.com", anniversary: "2022-09-21", cooling_days: 30, notes: "Possible advisor." },
  { name: "Liam O'Connor", title: "VC Associate", company: "Northwind", city: "New York", email: "liam@example.com", cooling_days: 45, notes: "Seed-stage, fintech focus." },
  { name: "Aiko Tanaka", title: "Researcher", company: "DeepMind", city: "Tokyo", email: "aiko@example.com", birthday: "1992-11-30", cooling_days: 60, notes: "Sent paper draft." },
  { name: "Noah Kim", title: "Recruiter", company: "Stripe", city: "Dublin", email: "noah@example.com", cooling_days: 30, notes: "Job lead — staff PM." },
  { name: "Priya Singh", title: "CTO", company: "Loomly", city: "Bangalore", email: "priya@example.com", birthday: "1988-03-18", cooling_days: 21, notes: "Co-founder of friend's startup." },
  { name: "Elena García", title: "Marketing Lead", company: "Notion", city: "Madrid", email: "elena@example.com", cooling_days: 30, notes: "Helped with launch copy." },
];

const GROUPS = [
  { name: "Investors", color: "#a78bfa" },
  { name: "Friends", color: "#34d399" },
  { name: "Recruiters", color: "#fb923c" },
  { name: "Founders", color: "#60a5fa" },
];

export async function seedDemo(userId: string) {
  // Clear existing user data first
  await supabase.from("reminders").delete().eq("user_id", userId);
  await supabase.from("interactions").delete().eq("user_id", userId);
  await supabase.from("contact_groups").delete().eq("user_id", userId);
  await supabase.from("contacts").delete().eq("user_id", userId);
  await supabase.from("groups").delete().eq("user_id", userId);

  const { data: groups } = await supabase
    .from("groups")
    .insert(GROUPS.map((g) => ({ ...g, user_id: userId })))
    .select();

  const now = new Date();
  const contactsPayload = SAMPLE.map((c, i) => {
    const daysAgo = [2, 50, 5, 90, 12, 1, 40, 25][i] ?? 10;
    const last = new Date(now);
    last.setDate(last.getDate() - daysAgo);
    return { ...c, user_id: userId, last_contacted_at: last.toISOString() };
  });
  const { data: contacts } = await supabase.from("contacts").insert(contactsPayload).select();

  if (contacts && groups) {
    const cg: any[] = [];
    contacts.forEach((c, i) => {
      const g = groups[i % groups.length];
      cg.push({ contact_id: c.id, group_id: g.id, user_id: userId });
    });
    await supabase.from("contact_groups").insert(cg);

    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
    await supabase.from("reminders").insert([
      { user_id: userId, contact_id: contacts[0].id, title: "Send portfolio link", due_date: today.toISOString().slice(0, 10) },
      { user_id: userId, contact_id: contacts[1].id, title: "Follow up on hiring chat", due_date: today.toISOString().slice(0, 10) },
      { user_id: userId, contact_id: contacts[3].id, title: "Share deck v2", due_date: tomorrow.toISOString().slice(0, 10) },
      { user_id: userId, contact_id: contacts[5].id, title: "Confirm interview slot", due_date: nextWeek.toISOString().slice(0, 10) },
    ]);

    await supabase.from("interactions").insert([
      { user_id: userId, contact_id: contacts[0].id, kind: "meeting", note: "Coffee at Sightglass — discussed roadmap.", occurred_at: new Date(now.getTime() - 2 * 86400000).toISOString() },
      { user_id: userId, contact_id: contacts[1].id, kind: "email", note: "Sent intro to Sam.", occurred_at: new Date(now.getTime() - 50 * 86400000).toISOString() },
    ]);
  }
}
