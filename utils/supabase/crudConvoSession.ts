import { supabase } from "@/lib/supabase";
import { ConvoSession, ConvoSessionReply, Profile, TranscriptionEntry } from "@/types/types";

/**
 * Fetch all conversations for a convo
 * Pulls caller info from the convo table
 */
export const fetchConvoSessionByConvoId = async (
  convo_id: string,
  page = 0,
  range = 10
): Promise<ConvoSession[]> => {
  const { data, error } = await supabase
    .from("convo_session")
    .select(`
      *,
      convo:convo_id (
        caller:caller_id (*),
        callee:user_id (*)
      ),
      convo_session_reply(*)
    `)
    .eq("convo_id", convo_id)
    .order("created_at", { ascending: false }) // latest first
    .range(page * range, (page + 1) * range - 1); // paginate on server

  if (error) {
    console.error("Error fetching fetchConvoSessionByConvoId:", error);
    return [];
  }

  if (!data) return [];

  return data.map((session: any) => ({
    id: session.id,
    convo_id: session.convo_id,
    caller: session.convo?.caller as Profile,
    callee: session.convo?.callee as Profile,
    reply: session.convo_session_reply as ConvoSessionReply[] || [],
    created_at: session.created_at,
    duration: session.duration,
    transcript: session.transcript as TranscriptionEntry[],
  }));
};
