import CapsuleCard from "@/components/CapsuleCard";
import { ProfileCard } from "@/components/ProfileCard";
import { ThemedText } from "@/components/ThemedText";
import { useSearchCapsules } from "@/hooks/useCapsulesSearch";
import { useSearchProfiles } from "@/hooks/useProfileSearch";

import React, { useState } from "react";
import { FlatList, TextInput, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [query, setQuery] = useState("");

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

  // Render Author section as the header of FlatList
  const renderHeader = () => (
    <View className="mb-4">
      {profiles.length > 0 && (
        <>
          <ThemedText className="text-lg font-semibold mb-2">Author</ThemedText>
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onToggleSub={handleToggleSubProfile}
              hideDetails
            />
          ))}
        </>
      )}

      {loading && <ThemedText className="text-gray-500 mt-2">Loading...</ThemedText>}

      {capsules.length > 0 && (
        <ThemedText className="mt-4 mb-2 text-lg font-semibold">Messages</ThemedText>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className="flex-1 bg-gray-200 dark:bg-gray-900 p-2">
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
          refetchProfiles();
          refetchCapsules();
        }}
      />

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
        ListHeaderComponent={renderHeader}
        onEndReached={fetchMoreCapsules}
        onEndReachedThreshold={0.5}
        refreshing={loadingCapsules}
        onRefresh={refetchCapsules}
        className="flex-1"
      />
    </SafeAreaView>
  );
}
