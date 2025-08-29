import { useAuth } from "@/services/providers/AuthProvider";
import { Profile } from "@/types/types";
import { fetchSubscribers } from "@/utils/supabase/crudSub";
import { useEffect, useState } from "react";

export const useSubsByProfileId = (profileId: string) => {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<Profile[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const range = 10; // subscribers per page

  const refetch = () => {
    setSubscribers([]);
    setPage(0);
    setTriggerRefetch(prev => !prev);
  };

  const fetchMore = () => {
    setPage(prev => prev + 1);
  };

  const loadSubscribers = async () => {
    if (!profileId) return;
    setIsLoading(true);
    try {
      const pageData = await fetchSubscribers(profileId, user?.id || null, page, range);
      setSubscribers(prev => [...prev, ...pageData]);
    } catch (err) {
      console.error("useSubscribers error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /** Dummy toggle: just flip isSub for a given profileId */
  const handleSubToggle = (targetId: string) => {
    setSubscribers(prev =>
      prev.map(p =>
        p.id === targetId ? { ...p, isSub: !p.isSub } : p
      )
    );
  };

  useEffect(() => {
    loadSubscribers();
  }, [page, triggerRefetch, user?.id]);

  return { subscribers, isLoading, fetchMore, refetch, handleSubToggle };
};
