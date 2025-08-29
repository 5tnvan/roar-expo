import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/services/providers/AuthProvider";
import type { Capsule, CapsuleCall } from "@/types/types";
import { fetchCapsuleWithCallAnalytics } from "@/utils/supabase/fetchCapsule"; // adjust path
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, useColorScheme, View } from "react-native";
import Markdown from "react-native-markdown-display";

interface CallStatsProps {
  visible: boolean;
  capsule_id: string;
  onClose: () => void;
}

export default function CallStats({ visible, capsule_id, onClose }: CallStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    fetchCapsuleWithCallAnalytics(capsule_id, user?.id || '')
      .then(data => setCapsule(data))
      .finally(() => setLoading(false));
  }, [visible, capsule_id, user?.id]);


  const renderCallStats = () => {
    if (!capsule?.call_stats || capsule.call_stats.length === 0) {
      return "No calls yet.";
    }

    return capsule.call_stats
      .map((call: CapsuleCall, index: number) => {
        const durationMin = Math.floor(call.duration / 60);
        const durationSec = call.duration % 60;
        return `**Call #${index + 1}**  
Caller: @${call.caller.handle}  
Duration: ${durationMin}m ${durationSec}s  
Transcript:  
${call.transcript || "_No transcript_"}\n`;
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
          <ThemedText className="text-white text-lg font-bold">Call Stats</ThemedText>
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
            {loading ? "_Loading..._" : renderCallStats()}
          </Markdown>
        </ScrollView>
      </View>
    </Modal>
  );
}
