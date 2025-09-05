import CapsuleCard from "@/components/cards/CapsuleCard";
import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import React from "react";
import {
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type PreviewProps = {
  visible: boolean;
  title: string;
  content: string;
  img_uri: string;
  pdf_uri?: string;
  pdf_content?: string;
  onClose: () => void;
};

export default function PreviewModal({
  visible,
  title,
  content,
  img_uri,
  pdf_uri,
  pdf_content,
  onClose,
}: PreviewProps) {
  const { profile } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const capsule: Capsule = {
    id: "placeholder",
    created_at: new Date().toISOString(),
    title: title,
    pdf_url: pdf_uri,
    pdf_content: pdf_content,
    content: content,
    image_url: img_uri,
    owner: {
      id: profile?.id || "",
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
      handle: profile?.handle || "",
      intro: "",
      isSub: profile?.isSub,
      subCount: profile?.subCount,
    },
  stats: {
    capsule_id: "placeholder",
    views: 12000,
    likes: 5500,
    calls: 1203,
    duration: 434333,
    share: 455,
  },
  call_stats: [],
  like_stats: [],
  isLiked: true,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className={`flex-1 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}
      >
        {/* Header */}
        <ThemedView className="flex-row justify-between items-center p-4 border-b border-gray-500/20">
          <ThemedText className="text-white text-lg font-bold">
            Preview
          </ThemedText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <ThemedText className="text-blue-400">Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Capsule Preview */}
        <ScrollView>
          <CapsuleCard
            capsule={capsule}
            onReadWithAI={() => Alert.alert("This is a preview only.")} onToggleSub={() => console.log("")} />
        </ScrollView>
      </View>
    </Modal>
  );
}
