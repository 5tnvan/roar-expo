// crudCapsuleComments.ts
import { supabase } from "@/lib/supabase";
import { CapsuleComment } from "@/types/types";

export const fetchCapsuleCommentsById = async (
  capsuleId: string,
  limit: number = 10,
  offset: number = 0
): Promise<CapsuleComment[] | null> => {
  const { data, error } = await supabase
    .from("capsule_comment")
    .select(
      `
      *,
      commenter:user_id (
        id,
        full_name,
        handle,
        avatar_url
      )
    `
    )
    .eq("capsule_id", capsuleId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1); // ✅ pagination

  if (error) {
    console.error("Error fetching capsule comments by ID:", error);
    return null;
  }

  return data as CapsuleComment[];
};


// Insert a new comment
export const insertCapsuleComment = async (
  capsule_id: string,
  user_id: string,
  comment: string
): Promise<CapsuleComment | null> => {
  // Insert comment into capsule_comments
  const { data, error } = await supabase
    .from("capsule_comment")
    .insert({
      capsule_id,
      user_id,
      comment,
    })
    .select(
      `
      *,
      commenter:user_id (
        id,
        full_name,
        handle,
        avatar_url
      )
    `
    )
    .single();

  if (error) {
    console.error("Error inserting capsule comment:", error);
    return null;
  }

  // Increment comments stats
  const { error: rpcError } = await supabase.rpc(
    "increment_capsule_stats_comments",
    { capsule: capsule_id }
  );
  if (rpcError) {
    console.error("Error incrementing capsule comments:", rpcError);
  }

  return data as CapsuleComment;
};