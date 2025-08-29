import CapsuleCard from "@/components/CapsuleCard";
import { ProfileCard } from "@/components/ProfileCard";
import { ThemedText } from "@/components/ThemedText";
import { useSearchCapsules } from "@/hooks/useCapsulesSearch";
import { useSearchProfiles } from "@/hooks/useProfileSearch";

import React, { useState } from "react";
import { FlatList, Text, TextInput, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [query, setQuery] = useState("");

  // hooks for profiles + capsules
  const {
    profiles,
    isLoading: loadingProfiles,
    refetch: refetchProfiles,
    handleToggleSub: handleToggleSubProfile,
  } = useSearchProfiles(query);

  const {
    capsules,
    isLoading: loadingCapsules,
    fetchMore: fetchMoreCapsules,
    refetch: refetchCapsules,
    handleToggleSub: handleToggleSubCapsule,
  } = useSearchCapsules(query);

  const loading = loadingProfiles || loadingCapsules;

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className="flex-1 p-2 bg-gray-200 dark:bg-gray-900">
      <TextInput
        placeholder="Searching for..."
        placeholderTextColor={isDark ? "#aaa" : "#555"}
        className={`border border-gray-300 rounded-lg px-3 py-2 mt-2 ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
        value={query.toLocaleLowerCase()}
        style={{ fontSize: 24, padding: 10 }}
        onChangeText={(text) => {
          setQuery(text);
          // reset results on new query
          refetchProfiles();
          refetchCapsules();
        }}
      />

      {loading && <Text className="mt-4 text-gray-500">Loading...</Text>}

      {profiles.length > 0 && (
        <>
          <ThemedText className="my-2 text-lg font-semibold">Author</ThemedText>
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="">
                <ProfileCard
                  profile={item}
                  onToggleSub={handleToggleSubProfile}
                  hideDetails
                />
              </View>
            )}
          />
        </>
      )}

      {capsules.length > 0 && (
        <>
          <ThemedText className="mt-4 mb-2 text-lg font-semibold">Messages</ThemedText>
          <FlatList
            data={capsules}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mt-1">
                <CapsuleCard
                  capsule={item}
                  onReadWithAI={() => console.log("hey")}
                  onToggleSub={handleToggleSubCapsule}
                />
              </View>
            )}
            onEndReached={fetchMoreCapsules}
            onEndReachedThreshold={0.5}
            refreshing={loadingCapsules}
            onRefresh={refetchCapsules}
          />
        </>
      )}
    </SafeAreaView>
  );
}
