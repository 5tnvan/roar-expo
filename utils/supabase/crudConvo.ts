import { supabase } from "@/lib/supabase";
import { Convo } from "@/types/types";

/**
 * Fetch convos where the logged-in user is the `user_id`
 */
export const fetchConvosByUserId = async (
  user_id: string,
  page = 0,
  range = 10
): Promise<Convo[]> => {
  const from = page * range;
  const to = from + range - 1;

  const { data, error } = await supabase
    .from("convo")
    .select(`
      *,
      user:user_id (*),
      caller:caller_id (*)
    `)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching convos by user_id:", error);
    return [];
  }

  return data?.map((convo: any) => ({
    id: convo.id,
    user: convo.user,
    caller: convo.caller,
    created_at: convo.created_at,
  })) || [];
};

/**
 * Fetch convos where the logged-in user is the `caller_id`
 */
export const fetchConvosByCallerId = async (
  caller_id: string,
  page = 0,
  range = 10
): Promise<Convo[]> => {
  const from = page * range;
  const to = from + range - 1;

  const { data, error } = await supabase
    .from("convo")
    .select(`
      *,
      user:user_id (*),
      caller:caller_id (*)
    `)
    .eq("caller_id", caller_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching convos by caller_id:", error);
    return [];
  }

  return data?.map((convo: any) => ({
    id: convo.id,
    user: convo.user,
    caller: convo.caller,
    created_at: convo.created_at,
  })) || [];
};
