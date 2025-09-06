import { supabase } from "@/lib/supabase";

/**
 * Request account deletion
 * Only inserts user_id. If it already exists, returns the error.
 */
export const profile_delete = async (user_id: string): Promise<Error | null> => {
  const { error } = await supabase
    .from("profile_delete")
    .insert({ user_id, status: "requested" });

  return error || null;
};


