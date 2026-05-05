import { supabase } from "@/integrations/supabase/client";
import { seedDemo } from "@/lib/demo";

export async function startDemo() {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Could not start demo session");
  await seedDemo(userId);
  return userId;
}

export async function exitDemo() {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (userId) {
    await supabase.from("reminders").delete().eq("user_id", userId);
    await supabase.from("interactions").delete().eq("user_id", userId);
    await supabase.from("contact_groups").delete().eq("user_id", userId);
    await supabase.from("contacts").delete().eq("user_id", userId);
    await supabase.from("groups").delete().eq("user_id", userId);
  }
  await supabase.auth.signOut();
}
