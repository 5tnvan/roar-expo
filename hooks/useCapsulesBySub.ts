import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { fetchCapsulesBySub } from "@/utils/supabase/crudCapsule";
import { useEffect, useState } from "react";

export const useCapsulesBySub = (user_id: string) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [page, setPage] = useState(0);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const [endReached, setEndReached] = useState(false);

  const range = 5; // capsules per page

  const refetch = () => {
    setPage(0);
    setCapsules([]);
    setEndReached(false); // reset
    setTriggerRefetch(prev => !prev);
  };

  const fetchMore = () => {
    if (endReached || isLoading) return; // prevent extra calls
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
    if (!user?.id || endReached) return;
    setIsLoading(true);

    try {
      const pageCapsules = await fetchCapsulesBySub(user_id, page, range);
      if (!pageCapsules) return;

      // If fetched less than requested, mark end reached
      if (pageCapsules.length < range) setEndReached(true);

      // Merge new capsules with existing ones,
      // keeping any local subscription state
      setCapsules(prev => 
        page === 0 
          ? pageCapsules
          : [...prev, ...pageCapsules].map(c => {
              const existing = prev.find(p => p.id === c.id);
              return existing ? { ...c, owner: { ...c.owner, isSub: existing.owner.isSub } } : c;
            })
      );
    } catch (err) {
      console.error("useCapsulesBySub unexpected error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, [page, triggerRefetch, user?.id]);

  return { isLoading, capsules, handleToggleSub, fetchMore, refetch, endReached };
};
