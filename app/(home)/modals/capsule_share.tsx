// CapsuleShareModal.tsx
import ShareCard from "@/components/cards/ShareCard";
import ShareCardWithAvatar from "@/components/cards/ShareCardWithAvatar";
import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import { Capsule } from "@/types/types";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CapsuleShareModalProps {
  visible: boolean;
  onClose: () => void;
  capsule: Capsule;
}

const { width } = Dimensions.get("window");

export default function CapsuleShareModal({
  visible,
  onClose,
  capsule,
}: CapsuleShareModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = [
    { key: "basic", component: <ShareCard capsule={capsule} /> },
    { key: "withAvatar", component: <ShareCardWithAvatar capsule={capsule} /> },
  ];

  const onViewRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  );

  return (
    <Modal visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView
        className={`flex-1 ${isDark ? "bg-black" : "bg-zinc-100"}`}
      >
        {/* ✅ Header */}

        <ThemedView className="flex-row justify-between items-center p-4 border-b border-gray-500/20">
                  <ThemedText className="text-white text-lg font-bold">Share</ThemedText>
                  <TouchableOpacity onPress={onClose} className="p-2">
                    <ThemedText className="text-blue-400">Close</ThemedText>
                  </TouchableOpacity>
                </ThemedView>

        {/* Cards */}
        <View className="flex-1 justify-center items-center">
          <FlatList
            data={cards}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={{
                  width,
                  paddingHorizontal: 15,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {item.component}
              </View>
            )}
            keyExtractor={(item) => item.key}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          />

          {/* Pagination dots */}
          <View className="flex-row justify-center items-center mt-4">
            {cards.map((_, i) => (
              <View
                key={i}
                className={`h-2 w-2 mx-1 rounded-full ${
                  i === activeIndex
                    ? isDark
                      ? "bg-white"
                      : "bg-zinc-800"
                    : "bg-zinc-400"
                }`}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
