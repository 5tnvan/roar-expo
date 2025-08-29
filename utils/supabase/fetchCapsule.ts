import { supabase } from "@/lib/supabase";
import { Capsule } from "@/types/types";

/**
 * Helper to map raw capsule data to Capsule type
 */
const mapCapsules = (capsules: any[], user_id: string): Capsule[] => {
  return capsules.map((c: any): Capsule => {
    const ownerData: any = c.owner || {};
    const subCount = ownerData.subCount?.[0]?.count || 0;
    const isSub = ownerData.isSub?.some((s: any) => s.subscriber_id === user_id) || false;

    // Determine if the current user liked this capsule
    const isLiked = c.is_liked?.some((l: any) => l.liker_id === user_id) || false;

    return {
      ...c,
      owner: {
        ...ownerData,
        subCount,
        isSub,
      },
      stats: c.stats?.[0] || { views: 0, likes: 0, calls: 0, duration: 0, share: 0 },
      like_stats: c.likes || [], // array of likes
      call_stats: c.calls || [],
      isLiked, // ✅ new property
    };
  });
};

export const fetchAllCapsules = async (
  user_id: string,
  page: number,
  range: number
): Promise<Capsule[] | null> => {
  const from = page * range;
  const to = (page + 1) * range - 1;

  const { data: capsules, error } = await supabase
    .from("capsule")
    .select(`
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching capsules page:", error);
    return null;
  }

  if (!capsules || capsules.length === 0) return [];

  // Increment views using RPC
  const capsuleIds = capsules.map(c => c.id);
  const { error: rpcError } = await supabase.rpc("increment_capsule_stats_views", {
    capsule_ids: capsuleIds,
  });
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);

  return mapCapsules(capsules, user_id);
}; 

export const fetchLikedCapsules = async (
  user_id: string,
  page: number,
  range: number
): Promise<Capsule[] | null> => {
  const from = page * range;
  const to = (page + 1) * range - 1;

  const { data: capsules, error } = await supabase
    .from("capsule_like")
    .select(`
      capsule:capsule_id (
        *,
        owner:owner_id (
          id,
          full_name,
          handle,
          avatar_url,
          subCount:sub!sub_account_id_fkey(count),
          isSub:sub!sub_account_id_fkey(subscriber_id)
        ),
        stats:capsule_stats(*),
        is_liked:capsule_like!left(liker_id)
      )
    `)
    .eq("liker_id", user_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching liked capsules page:", error);
    return null;
  }

  if (!capsules || capsules.length === 0) return [];

  // Unwrap capsule objects from the join
  const unwrapped = capsules.map((c: any) => c.capsule);

  // Increment views using RPC
  const capsuleIds = unwrapped.map(c => c.id);
  const { error: rpcError } = await supabase.rpc("increment_capsule_stats_views", {
    capsule_ids: capsuleIds,
  });
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);

  return mapCapsules(unwrapped, user_id);
};

export const fetchCapsulesByOwner = async (
  owner_id: string,
  user_id: string,
  page: number,
  range: number
): Promise<Capsule[] | null> => {
  const from = page * range;
  const to = (page + 1) * range - 1;

  const { data: capsules, error } = await supabase
    .from("capsule")
    .select(`
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `)
    .eq("owner_id", owner_id)
    .order("created_at", { ascending: false })
    .range(from, to); // ✅ pagination

  if (error) {
    console.error("Error fetching capsules:", error);
    return null;
  }

  if (!capsules || capsules.length === 0) return [];

  const capsuleIds = capsules.map(c => c.id);
  const { error: rpcError } = await supabase.rpc("increment_capsule_stats_views", {
    capsule_ids: capsuleIds,
  });
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);

  return mapCapsules(capsules, user_id);
};

export const fetchCapsulesBySub = async (
  user_id: string,
  page: number,
  range: number
): Promise<Capsule[] | null> => {
  const from = page * range;
  const to = (page + 1) * range - 1;

  const { data: subs, error: subsError } = await supabase
    .from("sub")
    .select("account_id")
    .eq("subscriber_id", user_id);

  if (subsError) {
    console.error("Error fetching subscriptions:", subsError);
    return null;
  }

  const subscribedIds = subs?.map(s => s.account_id) || [];
  if (subscribedIds.length === 0) return [];

  const { data: capsules, error } = await supabase
    .from("capsule")
    .select(`
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `)
    .in("owner_id", subscribedIds)
    .order("created_at", { ascending: false })
    .range(from, to); // ✅ pagination

  if (error) {
    console.error("Error fetching capsules:", error);
    return null;
  }

  const capsuleIds = capsules.map(c => c.id);
  const { error: rpcError } = await supabase.rpc("increment_capsule_stats_views", {
    capsule_ids: capsuleIds,
  });
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);

  return mapCapsules(capsules, user_id);
};

export const searchCapsules = async (
  query: string,
  user_id: string,
  page: number,
  range: number
): Promise<Capsule[]> => {
  const from = page * range;
  const to = (page + 1) * range - 1;

  const { data: capsules, error } = await supabase
    .from("capsule")
    .select(`
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `)
    .ilike("title", `%${query}%`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error searching capsules:", error);
    return [];
  }

  if (!capsules || capsules.length === 0) return [];

  // Increment views using RPC
  const capsuleIds = capsules.map(c => c.id);
  const { error: rpcError } = await supabase.rpc("increment_capsule_stats_views", {
    capsule_ids: capsuleIds,
  });
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);

  return mapCapsules(capsules, user_id);
};

export const fetchCapsuleWithCallAnalytics = async (
  capsuleId: string,
  user_id: string
): Promise<Capsule | null> => {
  const { data, error } = await supabase
    .from('capsule')
    .select(`
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      calls:capsule_call(
        id,
          capsule_id,
          created_at,
          duration,
          transcript,
          caller:caller_id (
            id,
            full_name,
            handle,
            avatar_url
          )
      )
    `)
    .eq('id', capsuleId)
    .single();

  if (error) {
    console.error('Error fetching capsule with analytics:', error);
    return null;
  }

  if (!data) return null;

  const [mapped] = mapCapsules([data], user_id); // keep your mapping logic
  return mapped || null;
};

export const fetchCapsuleWithLikeAnalytics = async (
  capsuleId: string,
  user_id: string
): Promise<Capsule | null> => {
  const { data, error } = await supabase
    .from('capsule')
    .select(`
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      likes:capsule_like(
        id,
        capsule_id,
        created_at,
        liker:liker_id (
          id,
          full_name,
          handle,
          avatar_url
        )
      )
    `)
    .eq('id', capsuleId)
    .single();

  if (error) {
    console.error('Error fetching capsule with analytics:', error);
    return null;
  }

  if (!data) return null;

  const [mapped] = mapCapsules([data], user_id); // keep your mapping logic
  return mapped || null;
};

export const fetchCapsuleById = async (
  capsuleId: string,
  user_id: string
): Promise<Capsule | null> => {
  const { data, error } = await supabase
    .from('capsule')
    .select(`
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `)
    .eq('id', capsuleId)
    .single();

  if (error) {
    console.error('Error fetching capsule by ID:', error);
    return null;
  }

  if (!data) return null;

  // Increment views using RPC
  const { error: rpcError } = await supabase.rpc("increment_capsule_stats_views", {
    capsule_ids: [data.id],
  });
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);

  const [mapped] = mapCapsules([data], user_id);
  return mapped || null;
};