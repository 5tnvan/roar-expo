// CapsuleCommentsModal.tsx
import { Avatar } from "@/components/avatars/Avatar";
import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import { TruncatedText } from "@/components/TruncateText";
import { CapsuleComment } from "@/types/types";
import { timeAgo } from "@/utils/formatters/timeAgo";
import { fetchCapsuleCommentsById } from "@/utils/supabase/crudCapsuleComments";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface CapsuleCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  capsule_id: string;
}

const PAGE_SIZE = 10;

export default function CapsuleCommentsModal({
  visible,
  onClose,
  capsule_id,
}: CapsuleCommentsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [comments, setComments] = useState<CapsuleComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadComments = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await fetchCapsuleCommentsById(
          capsule_id,
          PAGE_SIZE,
          reset ? 0 : page * PAGE_SIZE
        );

        if (res) {
          if (reset) {
            setComments(res);
            setPage(1);
            setHasMore(res.length === PAGE_SIZE);
          } else {
            setComments((prev) => [...prev, ...res]);
            setPage((prev) => prev + 1);
            setHasMore(res.length === PAGE_SIZE);
          }
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setLoading(false);
      }
    },
    [capsule_id, page, loading]
  );

  useEffect(() => {
    if (visible) {
      loadComments(true); // Reset when modal opens
    }
  }, [visible, capsule_id]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadComments();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
        {/* Header */}
        <ThemedView className="flex-row justify-between items-center p-4 border-b border-gray-500/20">
          <ThemedText className="text-lg font-bold">Comments</ThemedText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <ThemedText className="text-blue-400">Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Comments List */}
        <View className="flex-1 flex-row justify-center">
          {comments.length === 0 && <ThemedText className="w-full text-center align-center my-4">
            Comments are sent in from a call.
            </ThemedText>}
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          className="flex-1"
          renderItem={({ item }) => (
            <View className="flex-col items-start gap-2 py-2 px-4 border-b border-gray-200 dark:border-zinc-700">
              <View className="flex flex-row justify-between w-full">
                <View className="flex flex-row items-center gap-2">
                  <Avatar uri={item.commenter?.avatar_url} showTick size={40} plan={item.commenter?.plan} />
                  <ThemedText className="font-semibold opacity-80">
                    @<TruncatedText text={item.commenter?.handle} maxLength={22} />
                  </ThemedText>
                </View>
                <ThemedText className="opacity-50">
                  {timeAgo(item.created_at)}
                </ThemedText>
              </View>
              <ThemedText className="opacity-70 my-1">{item.comment}</ThemedText>
            </View>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="small" className="my-4" /> : null
          }
        />
        </View>
        
      </View>
    </Modal>
  );
}
