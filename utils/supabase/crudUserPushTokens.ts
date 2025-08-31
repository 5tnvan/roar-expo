import { supabase } from "@/lib/supabase";
import { PushToken } from "@/types/types";

/**
 * Check if a push token exists
 */
export const getPushToken = async (token: string) => {
  try {
    const { data, error } = await supabase
      .from("user_push_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error) {
      console.warn("Warning checking push token:", error);
      return null;
    }

    return data as unknown as PushToken;
  } catch (err) {
    console.error("Error in getPushToken:", err);
    return null;
  }
};

/**
 * Insert a new push token
 */
export const insertPushToken = async (user_id: string, pushToken: PushToken) => {
  try {
    const { data, error } = await supabase
      .from("user_push_tokens")
      .insert([
        {
          user_id,
          token: pushToken.token,
          platform: pushToken.platform,
          device_id: pushToken.device_id,
        },
      ])
      .select();

    if (error) {
      console.warn("Warning insertPushToken:", error);
      return false;
    }

    return data as unknown as PushToken;
  } catch (err) {
    console.error("Error in insertPushToken:", err);
    return false;
  }
};

/**
 * Update existing push token with a new user_id or last_used
 */
export const updatePushTokenUserId = async (token: string, user_id: string) => {
  try {
    const { data, error } = await supabase
      .from("user_push_tokens")
      .update({ user_id })
      .eq("token", token);

    if (error) {
      console.warn("Warning updating push token:", error);
      return false;
    }

    return data as unknown as PushToken;
  } catch (err) {
    console.error("Error in updatePushTokenUserId:", err);
    return false;
  }
};
