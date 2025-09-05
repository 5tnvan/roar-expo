
import CapsuleCard from "@/components/cards/CapsuleCard";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { usePipecat } from "@/components/providers/PipeCatProvider";
import { ThemedText } from "@/components/template/ThemedText";
import { useCapsulesByOwner } from "@/hooks/useCapsulesByOwner";
import { useProfileByUserId } from "@/hooks/useProfileByUserId";
import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { profile } = useAuth();
  const { isLoading: loadingProfile, handleToggleSub: handleToggleSubProfile  } = useProfileByUserId(profile?.id || '');
  const { isLoading: loadingCapsules, capsules, handleToggleSub: handleToggleCapsule, fetchMore, } = useCapsulesByOwner(profile?.id || '');
  const { inCall, sendCapsule, sendConvoSession } = usePipecat();
  const router = useRouter();

  const handleCallAssistant = (profile: any, convo_session_id: string) => {
      sendConvoSession(profile, convo_session_id);
      router.push("/");
  }


  const handleReadWithAI = (capsule: Capsule) => {
        if (inCall) {
          Alert.alert(
            "Already in call",
            "Please hang up first.",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Go to Call",
                onPress: () => router.push("/"), // replace with your screen name
              }
            ],
            { cancelable: true })
        } else {
          sendCapsule(capsule);
          router.push("/");
        }
      };

  return (
    <SafeAreaView edges={['right', 'left']} className={`flex-1 bg-zinc-100 dark:bg-black`}>
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
      
    </SafeAreaView>
  );
}
