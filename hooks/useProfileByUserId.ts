import { useAuth } from "@/services/providers/AuthProvider";
import { Profile } from "@/types/types";
import { fetchProfileByUserId } from "@/utils/supabase/crudProfile";
import { useEffect, useState } from "react";

export const useProfileByUserId = (profile_id: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const { user } = useAuth();

  const refetch = () => {
    setTriggerRefetch(prev => !prev);
  };

  /** Dummy toggle first, can be replaced with real insert/delete calls */
  const handleToggleSub = async () => {
    if (!user?.id || !profile) return;

    const isSub = profile.isSub;
    const ownerId = profile.id;

    try {
      if (isSub) {
        // optional: await deleteSub(ownerId, user.id);
        setProfile(prev => prev ? { ...prev, isSub: false, subCount: (prev.subCount || 1) - 1 } : prev);
      } else {
        // optional: await insertSub(ownerId, user.id);
        setProfile(prev => prev ? { ...prev, isSub: true, subCount: (prev.subCount || 0) + 1 } : prev);
      }
    } catch (err) {
      console.error("handleToggleSub error:", err);
    }
  };

  const fetchProfile = async () => {
    if (!profile_id) return;
    setIsLoading(true);

    try {
      const data = await fetchProfileByUserId(profile_id, user?.id || '');
      setProfile(prev => {
        // preserve local sub state if already toggled
        if (!prev) return data;
        return { ...data, isSub: prev.isSub, subCount: prev.subCount };
      });
    } catch (err) {
      console.error("useProfileById unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [profile_id, triggerRefetch, user?.id]);

  return { isLoading, profile, refetch, handleToggleSub };
};
