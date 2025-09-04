import { supabase } from "@/lib/supabase";

export const updateCapsuleStatsShare = async (capsule_id: string) => {
  const { error: rpcError } = await supabase.rpc(
    "increment_capsule_stats_shares",
    {
      capsule: capsule_id, // pass the capsule UUID here
    }
  );

  if (rpcError) console.error("Error incrementing capsule shares:", rpcError);
};
