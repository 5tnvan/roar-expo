import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { fetchAllCapsules } from "@/utils/supabase/crudCapsule";
import { useEffect, useState } from "react";

export const useAllCapsules = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [page, setPage] = useState(0);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const range = 5; // capsules per page

  const refetch = () => {
    setPage(0);
    setCapsules([]);
    setTriggerRefetch(prev => !prev);
  };

  const fetchMore = () => {
    setPage(prev => prev + 1);
  };

  /** Update subscription state for all capsules with same owner */
  const handleToggleSub = (ownerId: string, newSubState: boolean) => {
    setCapsules(prev =>
      prev.map(c =>
        c.owner.id === ownerId
          ? { ...c, owner: { ...c.owner, isSub: newSubState } }
          : c
      )
    );
  };

  const fetchCapsules = async () => {
    setIsLoading(true);

    try {
      const pageCapsules = await fetchAllCapsules(user?.id || '', page, range);
      if (!pageCapsules) return;

      // Merge new capsules with existing ones,
      // keeping any local subscription state
      setCapsules(prev =>
        [...prev, ...pageCapsules].map(c => {
          const existing = prev.find(p => p.id === c.id);
          if (existing) {
            // Keep previous subscription state if exists
            return { ...c, owner: { ...c.owner, isSub: existing.owner.isSub } };
          }
          return c;
        })
      );
    } catch (err) {
      console.error("useAllCapsules error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on page change, refetch trigger, or user change
  useEffect(() => {
    fetchCapsules();
  }, [page, triggerRefetch, user?.id]);

  return { isLoading, capsules, fetchMore, refetch, handleToggleSub };
};
