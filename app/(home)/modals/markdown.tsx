import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import React from "react";
import { Modal, ScrollView, TouchableOpacity, useColorScheme, View } from "react-native";
import Markdown from "react-native-markdown-display";

interface MarkdownPreviewProps {
  visible: boolean;
  content: string;
  onClose: () => void;
}

export default function MarkdownModal({ visible,content, onClose }: MarkdownPreviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
          <ThemedText className="text-white text-lg font-bold">Message (visible to me only)</ThemedText>
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
            {content}
          </Markdown>
        </ScrollView>
      </View>
    </Modal>
  );
}
