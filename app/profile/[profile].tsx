
import CapsuleCard from "@/components/CapsuleCard";
import { usePipecat } from "@/components/pipecat/PipeCat";
import { ProfileCard } from "@/components/ProfileCard";
import { useCapsulesByOwner } from "@/hooks/useCapsulesByOwner";
import { useProfileByUserId } from "@/hooks/useProfileByUserId";
import { Capsule } from "@/types/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type RootStackParamList = {
  "(tabs)": undefined; // your tabs screen
  "OtherScreen": undefined; // other screens
};

export default function Profile() {
  const { profile: profile_id } = useLocalSearchParams();
  const { isLoading: loadingProfile, profile, handleToggleSub: handleToggleSubProfile  } = useProfileByUserId(profile_id as string);
  const { isLoading: loadingCapsules, capsules, handleToggleSub: handleToggleCapsule, fetchMore, } = useCapsulesByOwner(profile_id as string);
  const { sendCapsule } = usePipecat();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleReadWithAI = (capsule: Capsule) => {
      sendCapsule(capsule);
      navigation.navigate("(tabs)");
    };

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className="flex-1">
      {profile && <View className="m-2"><ProfileCard profile={profile} onToggleSub={handleToggleSubProfile} /></View>}
      
      {capsules && capsules.length > 0 ? (
        <FlatList
          data={capsules}
          keyExtractor={(item) => item.id}
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
        <Text className="text-center mt-4">No messages yet.</Text>
      )}
    </SafeAreaView>
  );
}
