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

  const refetch = () => {
    setCapsulesMap(prev => ({ ...prev, [activeTab]: [] }));
    setPagesMap(prev => ({ ...prev, [activeTab]: 0 }));
    setEndReachedMap(prev => ({ ...prev, [activeTab]: false }));
  };

  const fetchMore = () => {
    if (!endReachedMap[activeTab] && !isLoading) {
      setPagesMap(prev => ({ ...prev, [activeTab]: prev[activeTab] + 1 }));
    }
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

  const fetchCapsules = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      let pageCapsules: Capsule[] | null = [];

      switch (activeTab) {
        case 'similar':
          pageCapsules = await fetchSimilarCapsules(user.id, pagesMap[activeTab], range);
          console.log('Similar capsules fetched:', pageCapsules);
          break;
        case 'new':
          pageCapsules = await fetchNewCapsules(user.id, pagesMap[activeTab], range);
          console.log('New capsules fetched:', pageCapsules);
          break;
        case 'popular':
          pageCapsules = await fetchPopularCapsules(user.id, pagesMap[activeTab], range);
          console.log('Popular capsules fetched:', pageCapsules);
          break;
      }

      if (!pageCapsules || pageCapsules.length === 0) {
        setEndReachedMap(prev => ({ ...prev, [activeTab]: true }));
        return;
      }

      setCapsulesMap(prev => ({
        ...prev,
        [activeTab]: [
          ...prev[activeTab],
          ...pageCapsules.map(c => {
            const existing = prev[activeTab].find(p => p.id === c.id);
            return existing ? { ...c, owner: { ...c.owner, isSub: existing.owner.isSub } } : c;
          })
        ]
      }));

    } catch (err) {
      console.error(`Error fetching ${activeTab} capsules:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on page change, tab change, or user change
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
