import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import { useAuth } from "@/services/providers/AuthProvider";
import type { Capsule, CapsuleLike } from "@/types/types";
import { fetchCapsuleWithLikeAnalytics } from "@/utils/supabase/crudCapsule";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, useColorScheme, View } from "react-native";

interface LikeStatsProps {
  visible: boolean;
  capsule_id: string;
  onClose: () => void;
}

export default function LikeStatsModal({ visible, capsule_id, onClose }: LikeStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    fetchCapsuleWithLikeAnalytics(capsule_id, user?.id || "")
      .then(data => setCapsule(data))
      .finally(() => setLoading(false));
  }, [visible, capsule_id, user?.id]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
        {/* Header */}
        <ThemedView className="flex-row justify-between items-center p-4 border-b border-gray-500/20">
          <ThemedText className="text-white text-lg font-bold">Like Stats</ThemedText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <ThemedText className="text-blue-400">Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Content */}
        <ScrollView className="p-2">
          {loading ? (
            <ThemedText>Loading...</ThemedText>
          ) : capsule?.like_stats && capsule.like_stats.length > 0 ? (
            capsule.like_stats.map((like: CapsuleLike) => (
                <ThemedView key={like.liker.id} className="flex-row justify-between items-center mb-2 p-4 rounded-lg">
                <ThemedText>@{like.liker.handle}</ThemedText>
                <View className="flex-row justify-center items-center">
                  <Ionicons name={"hand-right-sharp"} size={18} color="green" />
                 <ThemedText className="opacity-60 text-sm">
                  {` `}approved
                </ThemedText>
                </View>
              </ThemedView>
            ))
          ) : (
            <ThemedText>No likes yet.</ThemedText>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
