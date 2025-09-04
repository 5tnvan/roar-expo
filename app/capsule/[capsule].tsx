
import CapsuleCard from "@/components/cards/CapsuleCard";
import { usePipecat } from "@/components/providers/PipeCatProvider";
import { useCapsuleById } from "@/hooks/useCapsuleById";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Capsule() {
  const { capsule: capsule_id } = useLocalSearchParams();
  const { capsule, isLoading, handleToggleSub } = useCapsuleById(capsule_id as string);
  const { sendCapsule } = usePipecat();
  const router = useRouter();

  const handleReadWithAI = () => {
    if (!capsule) return;

    sendCapsule(capsule);

    router.push("(tabs)");
  };

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className="flex-1">
      <ScrollView className="flex-1 mt-2">
        {isLoading ? (
          <ActivityIndicator size="large" className="mt-5" />
        ) : capsule ? (
          <CapsuleCard capsule={capsule} onReadWithAI={handleReadWithAI} onToggleSub={handleToggleSub} />
        ) : (
          <Text className="text-center mt-4">Capsule not found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
