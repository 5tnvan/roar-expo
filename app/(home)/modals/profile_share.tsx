// ProfileShareModal.tsx
import ShareProfileCardWithAvatar from "@/components/cards/ShareProfileCardWithAvatar";
import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import { Profile } from "@/types/types";
import React from "react";
import {
  Modal,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileShareModalProps {
  visible: boolean;
  onClose: () => void;
  profile: Profile;
}

export default function ProfileShareModal({
  visible,
  onClose,
  profile,
}: ProfileShareModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className={`flex-1 ${isDark ? "bg-black" : "bg-zinc-100"}`}>
        {/* Header */}
        <ThemedView className="flex-row justify-between items-center p-4 border-b border-gray-500/20">
          <ThemedText className="text-white text-lg font-bold">
            Share your QR
          </ThemedText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <ThemedText className="text-blue-400">Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Single Profile Card */}
        <View className="flex-1 justify-center items-center px-4">
          <ShareProfileCardWithAvatar profile={profile} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
