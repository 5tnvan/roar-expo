import { Capsule } from "@/types/types";
import { fetchPopularCapsules } from "@/utils/supabase/crudCapsule";
import { useEffect, useState } from "react";

export const usePopularCapsules = (user_id:string) => {
  const range = 5;

  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [page, setPage] = useState(0);
  const [endReached, setEndReached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = () => {
    setCapsules([]);
    setPage(0);
    setEndReached(false);
  };

  const fetchMore = () => {
    if (!endReached && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

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
    if (!user_id || endReached) return;
    setIsLoading(true);

    try {
      const pageCapsules = await fetchPopularCapsules(user_id, page, range);
      if (!pageCapsules || pageCapsules.length === 0) {
        setEndReached(true);
        return;
      }

      setCapsules(prev => [
        ...prev,
        ...pageCapsules.map(c => {
          const existing = prev.find(p => p.id === c.id);
          return existing
            ? { ...c, owner: { ...c.owner, isSub: existing.owner.isSub } }
            : c;
        }),
      ]);
    } catch (err) {
      console.error("Error fetching popular capsules:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();
  }, [page, user_id]);

  return {
    capsules,
    fetchMore,
    refetch,
    handleToggleSub,
    endReached,
    isLoading,
  };
};
