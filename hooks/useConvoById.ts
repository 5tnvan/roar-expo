import { ConvoSession } from "@/types/types";
import { fetchConvoSessionByConvoId } from "@/utils/supabase/crudConvoSession";
import { useEffect, useState } from "react";

/**
 * Hook to fetch room_convos for a room
 */
export const useConvoSessionByConvoId = (convo_id: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [convos, setConvos] = useState<ConvoSession[]>([]);
  const [page, setPage] = useState(0);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const range = 1; // optional pagination

  const refetch = () => {
    setPage(0);
    setConvos([]);
    setTriggerRefetch(prev => !prev);
  };

  const fetchMore = () => {
    setPage(prev => prev + 1);
  };

  const fetchConvos = async () => {
  if (!convo_id) return;

  setIsLoading(true);
  try {
    const pageConvos = await fetchConvoSessionByConvoId(convo_id, page, range);
    if (pageConvos.length > 0) {
      setConvos(prev => [...prev, ...pageConvos]);
    }
  } catch (err) {
    console.error("useRoomConvoByRoomId error:", err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchConvos();
  }, [page, triggerRefetch, convo_id]);

  return { isLoading, convos, fetchMore, refetch };
};