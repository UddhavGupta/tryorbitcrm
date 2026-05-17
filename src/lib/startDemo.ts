import { supabase } from "@/integrations/supabase/client";
import { seedDemo } from "@/lib/demo";

const isAnonUser = (u: any) =>
  !!u && (u.is_anonymous === true || (u.app_metadata as any)?.provider === "anonymous");

export async function startDemo() {
  // CRITICAL: never seed demo data onto a real (non-anonymous) account.
  // Always sign out any existing session first so signInAnonymously
  // produces a fresh anonymous user — Supabase otherwise returns the
  // existing session, which would cause seedDemo to nuke the real user's data.
  const { data: existing } = await supabase.auth.getUser();
  if (existing.user) {
    await supabase.auth.signOut();
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  const user = data.user;
  if (!user?.id) throw new Error("Could not start demo session");
  if (!isAnonUser(user)) {
    // Defensive: refuse to seed if for any reason the resulting session
    // is not anonymous.
    throw new Error("Demo session is not anonymous — aborting to protect your data.");
  }
  await seedDemo(user.id, { requireAnonymous: true });
  return user.id;
}

export async function exitDemo() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  // Only delete data if this really is an anonymous demo session.
  if (user && isAnonUser(user)) {
    await supabase.from("reminders").delete().eq("user_id", user.id);
    await supabase.from("interactions").delete().eq("user_id", user.id);
    await supabase.from("contact_groups").delete().eq("user_id", user.id);
    await supabase.from("contacts").delete().eq("user_id", user.id);
    await supabase.from("groups").delete().eq("user_id", user.id);
  }
  await supabase.auth.signOut();
}
