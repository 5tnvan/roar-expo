import { supabase } from "@/lib/supabase";
import { Capsule } from "@/types/types";

const mapCapsules = (capsules: any[], user_id: string): Capsule[] => {
  return capsules.map((c: any): Capsule => {
    const ownerData: any = c.owner || {};
    const subCount = ownerData.subCount?.[0]?.count || 0;
    const isSub =
      ownerData.isSub?.some((s: any) => s.subscriber_id === user_id) || false;

    // Determine if the current user liked this capsule
    const isLiked =
      c.is_liked?.some((l: any) => l.liker_id === user_id) || false;

    return {
      ...c,
      owner: {
        ...ownerData,
        subCount,
        isSub,
      },
      stats: c.stats?.[0] || {
        views: 0,
        likes: 0,
        calls: 0,
        duration: 0,
        share: 0,
        comments: 0,
      },
      like_stats: c.likes || [], // array of likes
      call_stats: c.calls || [],
      isLiked, // ✅ new property
    };
  });
};

export const fetchSimilarCapsules = async (
  user_id: string,
  page: number,
  range: number
): Promise<Capsule[] | null> => {
  const from = page * range;
  const to = from + range - 1;

  // Step 1: Get capsule IDs from the simple view
  const { data: capsuleIds, error: viewError } = await supabase
    .from("view_similar_capsules")
    .select("id")
    .range(from, to);

  if (viewError) {
    console.error("Error fetching capsule IDs from view:", viewError);
    return null;
  }

  if (!capsuleIds || capsuleIds.length === 0) return [];

  const ids = capsuleIds.map((c: any) => c.id);

  // Step 2: Fetch full capsules with owner, stats, likes
  const { data: capsules, error } = await supabase
    .from("capsule")
    .select(
      `
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        plan,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `
    )
    .eq("archived", false)
    .in("id", ids);

  if (error) {
    console.error("Error fetching capsules with details:", error);
    return null;
  }

  return mapCapsules(
    capsules.filter((c) => !!c), // remove undefined just in case
    user_id
  );
};

export const fetchPopularCapsules = async (
  user_id: string,
  page: number,
  range: number
): Promise<Capsule[] | null> => {
  const from = page * range;
  const to = from + range - 1;

  // Step 1: Get capsule IDs (already ordered by views in the view)
  const { data: capsuleIds, error: viewError } = await supabase
    .from("view_popular_capsules")
    .select("id")
    .range(from, to);

  if (viewError) {
    console.error("Error fetching capsule IDs from view:", viewError);
    return null;
  }

  if (!capsuleIds || capsuleIds.length === 0) return [];

  const ids = capsuleIds.map((c: any) => c.id);

  // Step 2: Fetch full capsules
  const { data: capsules, error } = await supabase
    .from("capsule")
    .select(
      `
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        plan,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `
    )
    .eq("archived", false)
    .in("id", ids);

  if (error) {
    console.error("Error fetching capsules with details:", error);
    return null;
  }

  return mapCapsules(
    capsules.filter((c) => !!c), // remove undefined just in case
    user_id
  );
};

export const fetchCapsulesAbove = async (
  user_id: string,
  page: number,
  range: number,
  views_cap: number,
): Promise<Capsule[] | null> => {
  const from = page * range;
  const to = from + range - 1;

  try {
    // Step 1: Get capsule stats with views > 3000
    const { data: statsData, error: statsError } = await supabase
      .from("capsule_stats")
      .select("capsule_id")
      .gt("views", views_cap)
      .order("views", { ascending: false }) // most viewed first
      .range(from, to);

    if (statsError) {
      console.error("Error fetching capsule stats:", statsError);
      return null;
    }

    if (!statsData || statsData.length === 0) return [];

    const capsuleIds = statsData.map((s: any) => s.capsule_id);

    // Step 2: Fetch full capsule details
    const { data: capsules, error: capsuleError } = await supabase
      .from("capsule")
      .select(`
        *,
        owner:owner_id (
          id,
          full_name,
          handle,
          avatar_url,
          plan,
          subCount:sub!sub_account_id_fkey(count),
          isSub:sub!sub_account_id_fkey(subscriber_id)
        ),
        stats:capsule_stats(*),
        is_liked:capsule_like!left(liker_id)
      `)
      .eq("archived", false)
      .in("id", capsuleIds);

    if (capsuleError) {
      console.error("Error fetching capsules:", capsuleError);
      return null;
    }

    return mapCapsules(capsules || [], user_id);
  } catch (err) {
    console.error("Unexpected error fetching popular capsules:", err);
    return null;
  }
};

export const fetchNewCapsules = async (
  user_id: string,
  page: number,
  range: number
): Promise<Capsule[] | null> => {
  const from = page * range;
  const to = from + range - 1;

  // Step 1: Get capsule IDs (already ordered by created_at in the view)
  const { data: capsuleIds, error: viewError } = await supabase
    .from("view_new_capsules")
    .select("id")
    .range(from, to);

  if (viewError) {
    console.error("Error fetching capsule IDs from view:", viewError);
    return null;
  }

  if (!capsuleIds || capsuleIds.length === 0) return [];

  const ids = capsuleIds.map((c: any) => c.id);

  // Step 2: Fetch full capsules
  const { data: capsules, error } = await supabase
    .from("capsule")
    .select(
      `
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        plan,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `
    )
    .eq("archived", false)
    .in("id", ids);

  if (error) {
    console.error("Error fetching capsules with details:", error);
    return null;
  }

  // Step 3: Reorder capsules to match the view order
  const orderedCapsules = ids
  .map((id) => capsules.find((c) => c.id === id))
  .filter((c) => !!c); // ✅ remove undefined

  return mapCapsules(orderedCapsules, user_id);
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
    .select(
      `
      capsule:capsule_id (
        *,
        owner:owner_id (
          id,
          full_name,
          handle,
          avatar_url,
          plan,
          subCount:sub!sub_account_id_fkey(count),
          isSub:sub!sub_account_id_fkey(subscriber_id)
        ),
        stats:capsule_stats(*),
        is_liked:capsule_like!left(liker_id)
      )
    `
    )
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
  const capsuleIds = unwrapped.map((c) => c.id);
  const { error: rpcError } = await supabase.rpc(
    "increment_capsule_stats_views",
    {
      capsule_ids: capsuleIds,
    }
  );
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
    .select(
      `
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        plan,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `
    )
    .eq("owner_id", owner_id)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .range(from, to); // ✅ pagination

  if (error) {
    console.error("Error fetching capsules:", error);
    return null;
  }

  // Filter out undefined/null capsules
  const validCapsules = (capsules || []).filter((c) => c);
  if (validCapsules.length === 0) return [];

  //Increment
  const capsuleIds = validCapsules.map((c) => c.id);
  const { error: rpcError } = await supabase.rpc(
    "increment_capsule_stats_views",
    { capsule_ids: capsuleIds }
  );
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

  const subscribedIds = subs?.map((s) => s.account_id) || [];
  if (subscribedIds.length === 0) return [];

  const { data: capsules, error } = await supabase
    .from("capsule")
    .select(
      `
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        plan,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `
    )
    .in("owner_id", subscribedIds)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .range(from, to); // ✅ pagination

  if (error) {
    console.error("Error fetching capsules:", error);
    return null;
  }

  // Step 3: Filter out undefined/null capsules just in case
  const validCapsules = (capsules || []).filter((c) => c);

  if (validCapsules.length === 0) return [];

  const capsuleIds = validCapsules.map((c) => c.id);

  const { error: rpcError } = await supabase.rpc(
    "increment_capsule_stats_views",
    {
      capsule_ids: capsuleIds,
    }
  );
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);

  return mapCapsules(capsules, user_id);
};

export const fetchCapsuleWithCallAnalytics = async (
  capsuleId: string,
  user_id: string
): Promise<Capsule | null> => {
  const { data, error } = await supabase
    .from("capsule")
    .select(
      `
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        plan,
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
            avatar_url,
            plan
          )
      )
    `
    )
    .eq("id", capsuleId)
    .eq("archived", false)
    .order("created_at", { foreignTable: "calls", ascending: false })
    .single();

  if (error) {
    console.error("Error fetching capsule with analytics:", error);
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
    .from("capsule")
    .select(
      `
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        plan,
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
          avatar_url,
          plan
        )
      )
    `
    )
    .eq("id", capsuleId)
    .eq("archived", false)
    .order("created_at", { foreignTable: "likes", ascending: false })
    .single();

  if (error) {
    console.error("Error fetching capsule with analytics:", error);
    return null;
  }

  if (!data) return null;

  const [mapped] = mapCapsules([data], user_id); // keep your mapping logic
  return mapped || null;
};

// INDIVIDUAL
export const fetchCapsuleById = async (
  capsuleId: string,
  user_id: string
): Promise<Capsule | null> => {
  const { data, error } = await supabase
    .from("capsule")
    .select(
      `
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        plan,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `
    )
    .eq("id", capsuleId)
    .single();

  if (error) {
    console.error("Error fetching capsule by ID:", error);
    return null;
  }

  if (!data) return null;

  // Increment views using RPC
  const { error: rpcError } = await supabase.rpc(
    "increment_capsule_stats_views",
    {
      capsule_ids: [data.id],
    }
  );
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);

  const [mapped] = mapCapsules([data], user_id);
  return mapped || null;
};

// INSERT
export const insertCapsule = async (
  owner_id: string,
  title: string,
  content: string,
  image_url: string,
  pdf_url?: string,
  pdf_content?: string
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
  const { error: statsError } = await supabase.from("capsule_stats").insert({
    capsule_id: capsuleData.id,
    views: views,
    likes: 0,
    calls: 0,
    duration: 0,
    share: 1,
    comments: 0,
  });

  if (statsError) {
    console.error("Error inserting capsule_stats:", statsError);
    // optional: rollback by deleting capsule
    return false;
  }

  return capsuleData;
};

// SEARCH
export const fetchPopularCapsuleTitles = async (
  range: number
): Promise<string[]> => {
  // Fetch popular capsules with their titles
  const { data: capsuleStats, error } = await supabase
    .from("capsule_stats")
    .select("views, capsule:capsule_id(title)")
    .order("views", { ascending: false })
    .limit(range);

  if (error) {
    console.error("Error fetching popular capsule titles:", error);
    return [];
  }

  if (!capsuleStats || capsuleStats.length === 0) return [];

  // Extract titles from nested capsule object
  return capsuleStats
    .map((c: any) => c.capsule?.title)
    .filter(Boolean) as string[];
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
    .select(
      `
      *,
      owner:owner_id (
        id,
        full_name,
        handle,
        avatar_url,
        plan,
        subCount:sub!sub_account_id_fkey(count),
        isSub:sub!sub_account_id_fkey(subscriber_id)
      ),
      stats:capsule_stats(*),
      is_liked:capsule_like!left(liker_id)
    `
    )
    .eq("archived", false)
    .ilike("title", `%${query}%`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error searching capsules:", error);
    return [];
  }

  if (!capsules || capsules.length === 0) return [];

  // Increment views using RPC
  const capsuleIds = capsules.map((c) => c.id);
  const { error: rpcError } = await supabase.rpc(
    "increment_capsule_stats_views",
    {
      capsule_ids: capsuleIds,
    }
  );
  if (rpcError) console.error("Error incrementing capsule views:", rpcError);

  return mapCapsules(capsules, user_id);
};

// ARCHIVE
export const archiveCapsule = async (capsule_id: string) => {
  const { data, error } = await supabase
    .from("capsule")
    .update({ archived: true })
    .eq("id", capsule_id)
    .select()
    .single(); // return updated capsule

  if (error) {
    console.error("Error archiving capsule:", error);
    return false;
  }

  return data;
};
