import InfiniteScroll from "@/components/InfiniteScroll";
import { usePopularCapsules } from "@/hooks/usePopularCapsules";
import { FC, useEffect, useRef } from "react";

interface CapsulesLoaderProps {
  userId: string;
}

const CapsulesLoader: FC<CapsulesLoaderProps> = ({ userId }) => {
  const {
    capsules,
    fetchMore,
    refetch,
    handleToggleSub,
    endReached,
    isLoading,
  } = usePopularCapsules(userId, 300);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!userId || hasFetchedRef.current) return;

    // Fetch first page only once
    fetchMore(); 
    hasFetchedRef.current = true;
  }, [userId, fetchMore]);

  return (
    <InfiniteScroll
      capsules={capsules}
      fetchMore={fetchMore}
      refetch={refetch}
      handleToggleSub={handleToggleSub}
      endReached={endReached}
      isLoading={isLoading}
    />
  );
};

export default CapsulesLoader;
