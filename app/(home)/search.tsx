import { Ionicons } from "@expo/vector-icons";
import CapsuleCard from "../../components/cards/CapsuleCard";
import { ProfileCard } from "../../components/cards/ProfileCard";
import { useSearchCapsules } from "../../hooks/useCapsulesSearch";
import { useSearchProfiles } from "../../hooks/useProfileSearch";
import { fetchPopularCapsuleTitles } from "../../utils/supabase/crudCapsule";

import { useEffect, useState } from "react";
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useColorScheme, View } from "react-native";
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
  <SafeAreaView edges={['right', 'bottom', 'left']} className="flex-1 bg-zinc-60 dark:bg-black">
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1">

        {/* Search input always at top */}
        <View className="flex-row items-center border-b border-gray-300 dark:border-zinc-700 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 z-10">
          <Ionicons name="search-sharp" size={24} color={isDark ? "grey" : "grey"} className="mr-2" />
          <TextInput
            placeholder="Search Roar"
            placeholderTextColor={isDark ? "#aaa" : "#555"}
            className={`flex-1 rounded-lg px-3 py-2 ${isDark ? "text-white" : "text-black"}`}
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

        {/* Popular titles or search results */}
        <View className="flex-1">
          {inputFocused && !capsules?.length && !profiles?.length && popularTitles.length > 0 ? (
            <ScrollView keyboardShouldPersistTaps="handled">
              {popularTitles.map((title, index) => {
                const firstSentence = title.replace(/[\.\?!,].*$/, "").trim();
                const isSelected = query.toLowerCase() === firstSentence.toLowerCase();
                return (
                  <TouchableOpacity
                    key={`${firstSentence}-${index}`}
                    onPress={() => {
                      setQuery(firstSentence);
                      refetchProfiles();
                      refetchCapsules();
                    }}
                    className={`flex-row items-center py-4 px-2 border-b border-gray-300 dark:border-zinc-700 ${
                      isSelected ? "bg-green-100 dark:bg-green-900" : ""
                    }`}
                  >
                    <Ionicons
                      name="search-outline"
                      size={20}
                      color={isDark ? "grey" : "grey"}
                      className="mr-4"
                    />
                    <Text className={`text-xl ${isDark ? "text-white/50" : "text-black/50"}`}>
                      {firstSentence}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <FlatList
              data={capsules}
              keyExtractor={(item) => item.id}
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
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>

      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
</SafeAreaView>



  );
}
