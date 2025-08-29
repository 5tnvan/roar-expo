import { supabase } from "@/lib/supabase";

export const insertCapsule = async (
  owner_id: string,
  title: string,
  content: string,
  image_url: string,
  pdf_url?: string,
  pdf_content?: string,
) => {
  // Step 1: Insert capsule
  const { data: capsuleData, error: capsuleError } = await supabase
    .from("capsule")
    .insert({
      owner_id,
      title,
      pdf_url,
      pdf_content,
      content,
      image_url,
    })
    .select()
    .single(); // return the inserted capsule

  if (capsuleError) {
    console.error("Error inserting capsule:", capsuleError);
    return false;
  }

  // generate random views between 65–123
  const views = Math.floor(Math.random() * (123 - 65 + 1)) + 65;

  // Step 2: Insert default stats row
  const { error: statsError } = await supabase
    .from("capsule_stats")
    .insert({
      capsule_id: capsuleData.id,
      views: views,
      likes: 0,
      calls: 0,
      duration: 0,
      share: 1,
    });

  if (statsError) {
    console.error("Error inserting capsule_stats:", statsError);
    // optional: rollback by deleting capsule
    return false;
  }

  return capsuleData;
};
