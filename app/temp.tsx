import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/services/providers/AuthProvider";
import React from "react";
import { Modal, ScrollView, TouchableOpacity, useColorScheme, View } from "react-native";

interface LikeStatsProps {
  visible: boolean;
  capsule_id: string;
  onClose: () => void;
}

export default function Temp({ visible, onClose }: LikeStatsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

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
          <ThemedText className="text-white text-lg font-bold">Temp</ThemedText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <ThemedText className="text-blue-400">Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Markdown content */}
        <ScrollView className="p-4">
        </ScrollView>
      </View>
    </Modal>
  );
}
