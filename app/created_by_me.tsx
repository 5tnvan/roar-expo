import AppButton from '@/components/buttons/AppButton';
import CapsuleCard from '@/components/cards/CapsuleCard';
import { usePipecat } from '@/components/providers/PipeCatProvider';
import { ThemedText } from '@/components/template/ThemedText';
import BottomMenu from '@/components/ui/BottomMenu';
import { useCapsulesByOwner } from '@/hooks/useCapsulesByOwner';
import { useAuth } from '@/services/providers/AuthProvider';
import { Capsule } from '@/types/types';
import { Link, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreatedByMe() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  //context
  const { user } = useAuth();
  const router = useRouter();
  const { isLoading, capsules, handleToggleSub, fetchMore } = useCapsulesByOwner(user?.id || '');
  const { sendCapsule } = usePipecat();


  const handleReadWithAI = (capsule: Capsule) => {
    sendCapsule(capsule);
    router.push("(tabs)");
  };

  return (
    <SafeAreaView
      edges={['right', 'bottom', 'left']}
      className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}
    >
      {isLoading && capsules.length === 0 && (
        <ActivityIndicator size="large" className="mt-5" />
      )}

      {!isLoading && capsules.length === 0 && (
        <>
          <ThemedText className="mt-5 text-gray-500 text-center">
            You {`haven't`} created a message.
          </ThemedText>
          <View className="w-full items-center my-4">
            <Link href="/create_capsule" asChild>
              <AppButton
                title="+ New message"
                variant="primary"
                onPress={() => console.log("Pressed!")}
              />
            </Link>
          </View>
        </>
      )}
      <FlatList
        data={capsules}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <CapsuleCard
            capsule={item}
            onReadWithAI={handleReadWithAI}
            onToggleSub={handleToggleSub}
          />
        )}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && capsules.length > 0 ? (
            <ActivityIndicator size="small" className="my-4" />
          ) : null
        }
      /><BottomMenu />
    </SafeAreaView>
  );
}

