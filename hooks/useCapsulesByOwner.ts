import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { fetchCapsulesByOwner } from "@/utils/supabase/crudCapsule";
import { useEffect, useState } from "react";

export const useCapsulesByOwner = (owner_id: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [page, setPage] = useState(0);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const {user} = useAuth();
  const [endReached, setEndReached] = useState(false);

  const range = 5; // capsules per page

  const refetch = () => {
    setPage(0);
    setCapsules([]);
    setEndReached(false); // reset
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
    if (!owner_id) return;
    setIsLoading(true);

    try {
      const pageCapsules = await fetchCapsulesByOwner(owner_id, user?.id || '', page, range);
      if (!pageCapsules) return;

      // If fetched less than requested, mark end reached
      if (pageCapsules.length < range) setEndReached(true);
      
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
      console.error("useUserCapsules unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, [page, triggerRefetch]);

  return { isLoading, capsules, endReached, handleToggleSub, fetchMore, refetch };
};
