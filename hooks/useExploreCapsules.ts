import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { fetchNewCapsules, fetchPopularCapsules, fetchSimilarCapsules } from "@/utils/supabase/crudCapsule";
import { useEffect, useState } from "react";

type Tab = 'similar' | 'new' | 'popular';

export const useExploreCapsules = (initialTab: Tab = 'popular') => {
  const { user } = useAuth();
  const range = 5;

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Store capsules per tab
  const [capsulesMap, setCapsulesMap] = useState<Record<Tab, Capsule[]>>({
    similar: [],
    new: [],
    popular: [],
  });
  const [pagesMap, setPagesMap] = useState<Record<Tab, number>>({
    similar: 0,
    new: 0,
    popular: 0,
  });
  const [endReachedMap, setEndReachedMap] = useState<Record<Tab, boolean>>({
    similar: false,
    new: false,
    popular: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCapsules = async (pageOverride?: number) => {
    if (!user?.id) return;
    setIsLoading(true);
    const page = pageOverride ?? pagesMap[activeTab];

    try {
      let pageCapsules: Capsule[] = [];

      switch (activeTab) {
        case 'similar':
          pageCapsules = (await fetchSimilarCapsules(user.id, page, range)) || [];
          break;
        case 'new':
          pageCapsules = (await fetchNewCapsules(user.id, page, range)) || [];
          break;
        case 'popular':
          pageCapsules = (await fetchPopularCapsules(user.id, page, range)) || [];
          break;
      }

      if (pageCapsules.length === 0) {
        setEndReachedMap(prev => ({ ...prev, [activeTab]: true }));
        return;
      }

      setCapsulesMap(prev => ({
        ...prev,
        [activeTab]: pageOverride === 0 ? pageCapsules : [...prev[activeTab], ...pageCapsules],
      }));
    } catch (err) {
      console.error(`Error fetching ${activeTab} capsules:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMore = () => {
    if (!endReachedMap[activeTab] && !isLoading) {
      setPagesMap(prev => {
        const newPage = prev[activeTab] + 1;
        return { ...prev, [activeTab]: newPage };
      });
    }
  };

  const refetch = () => {
    setCapsulesMap(prev => ({ ...prev, [activeTab]: [] }));
    setPagesMap(prev => ({ ...prev, [activeTab]: 0 }));
    setEndReachedMap(prev => ({ ...prev, [activeTab]: false }));
    fetchCapsules(0); // fetch first page immediately
  };

  const handleToggleSub = (ownerId: string, newSubState: boolean) => {
    setCapsulesMap(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(c =>
        c.owner.id === ownerId
          ? { ...c, owner: { ...c.owner, isSub: newSubState } }
          : c
      ),
    }));
  };

  // Trigger fetch when page or activeTab changes
  useEffect(() => {
    fetchCapsules();
  }, [pagesMap[activeTab], activeTab, user?.id]);

  return {
    activeTab,
    setActiveTab,
    capsules: capsulesMap[activeTab],
    fetchMore,
    refetch,
    handleToggleSub,
    endReached: endReachedMap[activeTab],
    isLoading,
  };
};
