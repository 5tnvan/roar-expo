import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/types";

// Subscribe
export const insertSub = async (account_id: string, subscriber_id: string) => {
  const { data, error } = await supabase
    .from("sub")
    .insert({ account_id, subscriber_id })
    .select();
  if (error) {
    console.error("Error inserting sub:", error);
    return false;
  }
  return data;
};

// Unsubscribe
export const deleteSub = async (account_id: string, subscriber_id: string) => {
  const { data, error } = await supabase
    .from("sub")
    .delete()
    .eq("account_id", account_id)
    .eq("subscriber_id", subscriber_id);
  if (error) {
    console.error("Error deleting sub:", error);
    return false;
  }
  return true;
};

/**
 * Fetch all accounts that the current user is subscribed to
 */
export const fetchSubs = async (subscriber_id: string): Promise<Profile[] | false> => {
  const { data, error } = await supabase
    .from("sub")
    .select("account:account_id (id, full_name, handle, avatar_url)")
    .eq("subscriber_id", subscriber_id);

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return false;
  }

  // Map the response to Profile[]
  const profiles: Profile[] = data.map((d: any) => d.account);
  return profiles;
};

export const fetchSubscribers = async (
  profileId: string,
  viewerId: string | null,
  page: number,
  range: number
): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from("sub")
    .select(`
      subscriber:subscriber_id (
        *,
        subCount:sub!sub_account_id_fkey(count),
        subRelations:sub!sub_account_id_fkey(subscriber_id),
        capsuleCount:capsule!capsule_owner_id_fkey(count)
      )
    `)
    .eq("account_id", profileId)
    .range(page * range, (page + 1) * range - 1);

  if (error) {
    console.error("Error fetching subscribers:", error);
    return [];
  }

  return (data || []).map((d: any) => {
    const subscriber = d.subscriber;
    const isSub =
      viewerId && subscriber.subRelations
        ? subscriber.subRelations.some((s: any) => s.subscriber_id === viewerId)
        : false;

    return {
      id: subscriber.id,
      full_name: subscriber.full_name,
      handle: subscriber.handle,
      intro: subscriber.intro,
      avatar_url: subscriber.avatar_url,
      subCount: subscriber.subCount?.[0]?.count || 0,
      isSub,
      capsuleCount: subscriber.capsuleCount?.[0]?.count || 0,
    } as Profile;
  });
};
