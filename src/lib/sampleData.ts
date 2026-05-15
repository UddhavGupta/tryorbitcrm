import { supabase } from "@/integrations/supabase/client";
import { seedDemo } from "@/lib/demo";

/**
 * Loads the sample orbit dataset for the current authenticated user.
 * Reuses the demo seeder, which clears existing data first.
 */
export async function loadSampleData(userId: string) {
  await seedDemo(userId);
}

export async function loadSampleDataForCurrentUser() {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) throw new Error("Not signed in");
  await loadSampleData(uid);
}
