import { Convo } from "@/types/types";
import { fetchConvosByUserId } from "@/utils/supabase/crudConvo";
import { useEffect, useState } from "react";

export const useConvosByUserId = (user_id: string, range = 10) => {
  const [isLoading, setIsLoading] = useState(false);
  const [convos, setConvos] = useState<Convo[]>([]);
  const [page, setPage] = useState(0);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const refetch = () => {
    setPage(0);
    setConvos([]);
    setTriggerRefetch(prev => !prev);
  };

  const fetchMore = () => {
    setPage(prev => prev + 1);
  };

  const fetchConvos = async () => {
    if (!user_id) return;

    setIsLoading(true);
    try {
      // Fetch all convos and then paginate in-memory
      const allconvos = await fetchConvosByUserId(user_id);

      if (allconvos && allconvos.length > 0) {
        const from = page * range;
        const to = from + range;
        const pageconvos = allconvos.slice(from, to);

        setConvos(prev => [...prev, ...pageconvos]);
      }
    } catch (err) {
      console.error("useconvosByUserId error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConvos();
  }, [page, triggerRefetch, user_id]);

  return { isLoading, convos, fetchMore, refetch };
};
