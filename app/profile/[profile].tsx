
import CapsuleCard from "@/components/cards/CapsuleCard";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { usePipecat } from "@/components/providers/PipeCatProvider";
import { ThemedText } from "@/components/template/ThemedText";
import BottomMenu from "@/components/ui/BottomMenu";
import { useCapsulesByOwner } from "@/hooks/useCapsulesByOwner";
import { useProfileByUserId } from "@/hooks/useProfileByUserId";
import { Capsule } from "@/types/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { profile: profile_id } = useLocalSearchParams();
  const { isLoading: loadingProfile, profile, handleToggleSub: handleToggleSubProfile  } = useProfileByUserId(profile_id as string);
  const { isLoading: loadingCapsules, capsules, handleToggleSub: handleToggleCapsule, fetchMore, } = useCapsulesByOwner(profile_id as string);
  const { sendCapsule, sendConvoSession } = usePipecat();
  const router = useRouter();

  const handleCallAssistant = (profile: any, convo_session_id: string) => {
      sendConvoSession(profile, convo_session_id);
      router.push("(tabs)");
  }


  const handleReadWithAI = (capsule: Capsule) => {
      sendCapsule(capsule);
      router.push("(tabs)");
    };

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className={`flex-1 bg-white dark:bg-dark`}>
      {profile && <View className="m-2"><ProfileCard profile={profile} onToggleSub={handleToggleSubProfile} onCallAssistantWithAI={handleCallAssistant} /></View>}
      
      {capsules && capsules.length > 0 ? (
        <FlatList
          data={capsules}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => <CapsuleCard capsule={item} onReadWithAI={handleReadWithAI} onToggleSub={handleToggleCapsule} hideDetails />}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingCapsules && capsules.length > 0 ? (
              <ActivityIndicator size="small" className="my-4" />
            ) : null
          }
        />
      ) : (
        <ThemedText className="text-center mt-4">No messages yet.</ThemedText>
      )}
      <BottomMenu />
    </SafeAreaView>
  );
}
