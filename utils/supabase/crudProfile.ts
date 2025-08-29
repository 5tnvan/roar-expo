import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/types";

/**
 * Fetch a profile by ID with subscriber count, capsule count, and whether a specific user is subscribed
 * @param profile_id - the profile ID to fetch
 * @param user_id - the logged-in user ID
 */
export const fetchProfileByUserId = async (
  profile_id: string,
  user_id: string
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profile")
    .select(`
      *,
      subCount:sub!sub_account_id_fkey(count),
      isSub:sub!sub_account_id_fkey(subscriber_id),
      capsuleCount:capsule!capsule_owner_id_fkey(count)
    `)
    .eq("id", profile_id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  if (!data) return null;

  const profile: Profile = {
    id: data.id,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    language: data.language,
    handle: data.handle,
    intro: data.intro,
    subCount: data.subCount?.[0]?.count || 0,
    isSub: data.isSub?.some((s: any) => s.subscriber_id === user_id) || false,
    capsuleCount: data.capsuleCount?.[0]?.count || 0,
  };

  return profile;
};

export const fetchProfileByHandle = async (
  handle: string,
  user_id: string
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profile")
    .select(`
      *,
      subCount:sub!sub_account_id_fkey(count),
      isSub:sub!sub_account_id_fkey(subscriber_id),
      capsuleCount:capsule!capsule_owner_id_fkey(count)
    `)
    .eq("handle", handle)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  if (!data) return null;

  const profile: Profile = {
    id: data.id,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    language: data.language,
    handle: data.handle,
    intro: data.intro,
    subCount: data.subCount?.[0]?.count || 0,
    isSub: data.isSub?.some((s: any) => s.subscriber_id === user_id) || false,
    capsuleCount: data.capsuleCount?.[0]?.count || 0,
  };

  return profile;
};

/**
 * Search profiles by query (full_name or handle)
 */
export const searchProfiles = async (
  query: string,
  user_id: string
): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from("profile")
    .select(`
      *,
      subCount:sub!sub_account_id_fkey(count),
      isSub:sub!sub_account_id_fkey(subscriber_id),
      capsuleCount:capsule!capsule_owner_id_fkey(count)
    `)
    .ilike("full_name", `%${query}%`);

  if (error) {
    console.error("Error searching profiles:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  return data.map((p: any): Profile => ({
    id: p.id,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    language: p.language,
    handle: p.handle,
    intro: p.intro,
    subCount: p.subCount?.[0]?.count || 0,
    isSub: p.isSub?.some((s: any) => s.subscriber_id === user_id) || false,
    capsuleCount: p.capsuleCount?.[0]?.count || 0,
  }));
};


/**
 * Update a user's language in the profile table
 * @param userId - the ID of the user to update
 * @param langCode - the new language gemini_code
 * @returns boolean - true if update succeeded, false if failed
 */
export const updateProfileLanguage = async (userId: string, langCode: string): Promise<boolean> => {
  const { error } = await supabase
    .from("profile")
    .update({ language: langCode })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update language:", error.message);
    return false;
  }

  return true;
};

export const updateProfileAvatar = async (userId: string, avatar_url: string): Promise<boolean> => {
  const { error } = await supabase
    .from("profile")
    .update({ avatar_url: avatar_url })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update language:", error.message);
    return false;
  }

  return true;
};
