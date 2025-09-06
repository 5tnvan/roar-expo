import { supabase } from "@/lib/supabase";

/**
 * Flag a capsule by inserting into capsule_flagged table
 * @param capsule_id - ID of the capsule being flagged
 * @param flagger_id - flagger
 */
export const insertFlaggedCapsule = async (capsule_id: string, flagger_id: string) => {
  const { data, error } = await supabase
    .from("capsule_flagged")
    .insert({
      capsule_id,
      flagger_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error inserting flagged capsule:", error);
    return false;
  }

  return data;
};