import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import { useAuth } from "@/services/providers/AuthProvider";
import type { Capsule, CapsuleCall } from "@/types/types";
import { formatSecIntoMins } from "@/utils/formatters/formatSecIntoMins";
import { timeAgo } from "@/utils/formatters/timeAgo";
import { fetchCapsuleWithCallAnalytics } from "@/utils/supabase/crudCapsule";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, useColorScheme, View } from "react-native";

interface CallStatsProps {
  visible: boolean;
  capsule_id: string;
  onClose: () => void;
}

export default function CallStatsModal({ visible, capsule_id, onClose }: CallStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    fetchCapsuleWithCallAnalytics(capsule_id, user?.id || "")
      .then((data) => setCapsule(data))
      .finally(() => setLoading(false));
  }, [visible, capsule_id, user?.id]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${isDark ? "bg-zinc-900" : "bg-zinc-100"}`}>
        {/* Header */}
        <ThemedView className="flex-row justify-between items-center p-4 border-b border-gray-500/20">
          <ThemedText className="text-white text-lg font-bold">Call Stats</ThemedText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <ThemedText className="text-blue-400">Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Calls */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ThemedText className="text-gray-400">Loading...</ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerClassName="p-2">
            {capsule?.call_stats?.map((call: CapsuleCall) => (
              <View
                key={call.id}
                className={`mb-2 p-4 rounded-2xl ${isDark ? "bg-zinc-800" : "bg-white"}`}
              >
                {/* Call header */}
                <ThemedText className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Call ID: {call.id.slice(-6)}
                </ThemedText>
                <View className="flex-row justify-between items-center mb-2">
                  <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                    Duration: ~{formatSecIntoMins(call.duration)} ({call.duration} secs)
                  </ThemedText>
                  <ThemedText className="text-xs text-gray-400 dark:text-gray-500">
                    {timeAgo(call.created_at)}
                  </ThemedText>
                </View>

                {/* Call transcript */}
                {/* {Array.isArray(call.transcript) && call.transcript.length > 0 && (
                  <TranscriptionLog3 log={call.transcript as TranscriptionEntry[]} />
                )} */}
              </View>
            ))}
            {capsule?.call_stats && capsule?.call_stats.length === 0 && <ThemedText>No call stats yet.</ThemedText>}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}
