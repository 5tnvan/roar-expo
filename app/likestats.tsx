import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/services/providers/AuthProvider";
import type { Capsule, CapsuleLike } from "@/types/types";
import { fetchCapsuleWithLikeAnalytics } from "@/utils/supabase/fetchCapsule"; // adjust path
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, useColorScheme, View } from "react-native";
import Markdown from "react-native-markdown-display";

interface LikeStatsProps {
  visible: boolean;
  capsule_id: string;
  onClose: () => void;
}

export default function LikeStats({ visible, capsule_id, onClose }: LikeStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    fetchCapsuleWithLikeAnalytics(capsule_id, user?.id || '')
      .then(data => setCapsule(data))
      .finally(() => setLoading(false));
  }, [visible, capsule_id, user?.id]);

  const renderLikeStats = () => {
    if (!capsule?.like_stats || capsule.like_stats.length === 0) {
      return "No likes yet.";
    }

    return capsule.like_stats
      .map((like: CapsuleLike, index: number) => {
        return `**Like #${index + 1}**  
User: @${like.liker.handle} 
Timestamp: ${new Date(like.created_at).toLocaleString()}\n`;
      })
      .join("\n---\n");
  };

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

        {/* Markdown content */}
        <ScrollView className="p-4">
          <Markdown
            style={{
              body: {
                color: isDark ? "#fff" : "#000",
                fontSize: 16,
                lineHeight: 24,
              },
              heading1: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: isDark ? "#fff" : "#000" },
              heading2: { fontSize: 20, fontWeight: "bold", marginBottom: 6, color: isDark ? "#fff" : "#000" },
            }}
          >
            {loading ? "_Loading..._" : renderLikeStats()}
          </Markdown>
        </ScrollView>
      </View>
    </Modal>
  );
}
