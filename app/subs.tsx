import { ProfileCard } from "@/components/ProfileCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useSubsByProfileId } from "@/hooks/useSubsByProfileId";
import { Profile } from "@/types/types";
import React from "react";
import { ActivityIndicator, FlatList, Modal, Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface SubscribersModalProps {
  visible: boolean;
  onClose: () => void;
  profile: Profile;
}

export default function Subs({ visible, profile, onClose }: SubscribersModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { subscribers, isLoading, handleSubToggle, fetchMore } = useSubsByProfileId(profile.id);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
        {/* Header */}
        <ThemedView className="flex-row items-center justify-between p-4">
          <ThemedText className="text-white text-lg">
            <Text className="font-semibold">@{profile.handle} </Text>
            <Text>subscribers</Text>
          </ThemedText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <ThemedText className="text-blue-400">Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {isLoading && subscribers.length === 0 ? (
          <ThemedText className="text-white text-center mt-4">
            Loading...
          </ThemedText>
        ) : (
          <FlatList
            data={subscribers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="mx-2 my-1">
                <ProfileCard profile={item} onToggleSub={() => handleSubToggle(item.id)} hideDetails />
              </View>
            )}
            onEndReached={fetchMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoading ? (
                <ActivityIndicator size="small" className="my-4" />
              ) : null
            }
          />
        )}
      </View>
    </Modal>
  );
}
