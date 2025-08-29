import CapsuleCard from "@/components/CapsuleCard";
import { usePipecat } from "@/components/pipecat/PipeCat";
import { useCapsuleById } from "@/hooks/useCapsuleById";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Capsule() {
  const { capsule: capsule_id } = useLocalSearchParams();
  const { capsule, isLoading, handleToggleSub } = useCapsuleById(capsule_id as string);
  const { sendCapsule } = usePipecat();
  const navigation = useNavigation();

  const handleReadWithAI = () => {
    if (capsule) {
      sendCapsule(capsule);
      navigation.goBack();
    }
  };

  console.log("cap", capsule, capsule_id);

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className="flex-1">
      <ScrollView className="flex-1">
      {isLoading ? (
        <ActivityIndicator size="large" className="mt-5" />
      ) : capsule ? (
        <CapsuleCard capsule={capsule} onReadWithAI={() => handleReadWithAI()} onToggleSub={handleToggleSub} />
      ) : (
        <Text className="text-center mt-4">Capsule not found.</Text>
      )}
    </ScrollView>
    </SafeAreaView>
    
  );
}
