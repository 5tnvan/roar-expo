import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { searchCapsules } from "@/utils/supabase/fetchCapsule";
import { useEffect, useState } from "react";

export const useSearchCapsules = (query: string) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [page, setPage] = useState(0);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const range = 5; // items per page

  const refetch = () => {
    setPage(0);
    setCapsules([]);
    setTriggerRefetch(prev => !prev);
  };

  const fetchMore = () => {
    setPage(prev => prev + 1);
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

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id || !query) return;
      setIsLoading(true);

      try {
        const pageCapsules = await searchCapsules(query, user.id, page, range);
        if (pageCapsules) {
          setCapsules(prev => [...prev, ...pageCapsules]);
        }
      } catch (err) {
        console.error("useSearchCapsules unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [page, query, triggerRefetch, user?.id]);

  return { isLoading, capsules, fetchMore, refetch, handleToggleSub };
};
