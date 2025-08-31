import { useAuth } from "@/services/providers/AuthProvider";
import { Profile } from "@/types/types";
import { searchProfiles } from "@/utils/supabase/crudProfile";
import { useEffect, useState } from "react";

export const useSearchProfiles = (query: string) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const refetch = () => {
    setTriggerRefetch(prev => !prev);
  };

  /** Dummy toggle since only one profile per subscriber */
  const handleToggleSub = (profileId: string, newSubState: boolean) => {
    setProfiles(prev =>
      prev.map(p =>
        p.id === profileId
          ? { 
              ...p, 
              isSub: newSubState, 
              subCount: newSubState ? (p.subCount || 0) + 1 : Math.max((p.subCount || 1) - 1, 0) 
            }
          : p
      )
    );
  };

  useEffect(() => {
    const fetch = async () => {
      if (!query) {
        setProfiles([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchProfiles(query, user?.id || '');
        setProfiles(results.slice(0, 5)); // limit to 5 results
      } catch (err) {
        console.error("useSearchProfiles unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [query, triggerRefetch, user?.id]);

  return { isLoading, profiles, refetch, handleToggleSub };
};
