import CapsuleCard from "@/components/cards/CapsuleCard";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { ThemedView } from "@/components/template/ThemedView";
import { useSearchCapsules } from "@/hooks/useCapsulesSearch";
import { useSearchProfiles } from "@/hooks/useProfileSearch";
import { fetchPopularCapsuleTitles } from "@/utils/supabase/crudCapsule";
import { Ionicons } from "@expo/vector-icons";

import React, { useEffect, useState } from "react";
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [query, setQuery] = useState("");
  const [popularTitles, setPopularTitles] = useState<string[]>([]);
  const [inputFocused, setInputFocused] = useState(false);

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

  const handleCallAssistant = (profile: any) => {
    // handle AI assistant
  };

  // Fetch top popular titles once
  useEffect(() => {
    const loadPopular = async () => {
      const popular = await fetchPopularCapsuleTitles(12);
      console.log("Popular titles:", popular);
      setPopularTitles(popular);
    };
    loadPopular();
  }, []);

  // Render Author section
  const renderHeader = () => (
    <View className="m-2 gap-2">
      {profiles.length > 0 && profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          onToggleSub={handleToggleSubProfile}
          hideDetails
          onCallAssistantWithAI={handleCallAssistant}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className="flex-1 bg-zinc-60 dark:black">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            
            {/* Show popular titles only when input is focused */}
            {inputFocused && !capsules?.length && !profiles?.length && popularTitles.length > 0 && (
              <ThemedView className="flex-col">
                {popularTitles.map((title) => {
                  const match = title.match(/.*?[.?!]/);
                  const firstSentence = match ? match[0].trim() : title.trim();
                  return (
                    <TouchableOpacity key={title} onPress={() => setQuery(firstSentence)}>
                      <View className="flex-row items-center py-4 px-2 border-b border-gray-300 dark:border-zinc-700">
                        <Ionicons name="search-outline" size={20} color={isDark ? "grey" : "grey"} className="mr-4" />
                        <Text className={`text-xl ${isDark ? "text-white/50" : "text-black/50"}`}>
                          {firstSentence}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ThemedView>
            )}
            {/* Search res */}
            <FlatList
              className="flex-1"
              data={capsules}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => (
                <CapsuleCard
                  capsule={item}
                  onReadWithAI={() => console.log("hey")}
                  onToggleSub={handleToggleSubCapsule}
                />
              )}
              ListHeaderComponent={renderHeader}
              onEndReached={fetchMoreCapsules}
              onEndReachedThreshold={0.5}
              refreshing={loadingCapsules}
              onRefresh={refetchCapsules}
            />

            {/* Search input */}
            <View className="flex flex-row items-center border-t border-gray-300 dark:border-zinc-700">
              <Ionicons name="search-sharp" size={24} color={isDark ? "grey" : "grey"} className="ml-4" />
              <TextInput
                placeholder="Search Roar"
                placeholderTextColor={isDark ? "#aaa" : "#555"}
                className={`flex-1 rounded-lg px-2 py-5 ${isDark ? "text-white" : "text-black"}`}
                value={query}
                style={{ fontSize: 18 }}
                onChangeText={(text) => {
                  setQuery(text);
                  refetchProfiles();
                  refetchCapsules();
                }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
