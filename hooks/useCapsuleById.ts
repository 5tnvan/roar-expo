import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { deleteSub, insertSub } from "@/utils/supabase/crudSub";
import { fetchCapsuleById } from "@/utils/supabase/fetchCapsule";
import { useEffect, useState } from "react";

export const useCapsuleById = (capsule_id: string) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const refetch = () => {
    setTriggerRefetch(prev => !prev);
  };

  /** Toggle subscription state for this capsule's owner */
  const handleToggleSub = async () => {
    if (!user?.id || !capsule) return;

    const ownerId = capsule.owner.id;
    const isSub = capsule.owner.isSub;

    try {
      if (isSub) {
        const res = await deleteSub(ownerId, user.id);
        if (res) {
          setCapsule(prev =>
            prev ? { ...prev, owner: { ...prev.owner, isSub: false } } : prev
          );
        }
      } else {
        const res = await insertSub(ownerId, user.id);
        if (res) {
          setCapsule(prev =>
            prev ? { ...prev, owner: { ...prev.owner, isSub: true } } : prev
          );
        }
      }
    } catch (err) {
      console.error("useCapsuleById handleToggleSub error:", err);
    }
  };

  const fetchCapsule = async () => {
    if (!user?.id || !capsule_id) return;
    setIsLoading(true);

    try {
      const fetched = await fetchCapsuleById(capsule_id, user.id);
      if (!fetched) return;

      setCapsule(prev => {
        if (!prev) return fetched;
        // preserve local sub state if already toggled
        return {
          ...fetched,
          owner: { ...fetched.owner, isSub: prev.owner.isSub },
        };
      });
    } catch (err) {
      console.error("useCapsuleById fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsule();
  }, [capsule_id, triggerRefetch, user?.id]);

  return { isLoading, capsule, refetch, handleToggleSub };
};
