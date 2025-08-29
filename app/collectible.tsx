import CapsuleCard from '@/components/CapsuleCard';
import { usePipecat } from '@/components/pipecat/PipeCat';
import { ThemedText } from '@/components/ThemedText';
import AppButton from '@/components/ui/Button';
import { useLikedCapsules } from '@/hooks/useLikeCapsules.';
import { Capsule } from '@/types/types';
import { Link, useNavigation } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Explore() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  //context
  const { isLoading, capsules, handleToggleSub, fetchMore } = useLikedCapsules();
  const navigation = useNavigation();
  const { sendCapsule } = usePipecat();

  const handleReadWithAI = (capsule: Capsule) => {
    sendCapsule(capsule);
    navigation.goBack();
  };

  return (
    <SafeAreaView
      edges={['right', 'bottom', 'left']}
      className={`flex-1 ${isDark ? "bg-zinc-950" : "bg-slate-300"}`}
    >
      {isLoading && capsules.length === 0 && (
        <ActivityIndicator size="large" className="mt-5" />
      )}

      {!isLoading && capsules.length === 0 && (
        <>
          <ThemedText className="mt-5 text-gray-500 text-center">
            There are no messages.
          </ThemedText>
          <View className="w-full items-center my-4">
            <Link href="/explore" asChild>
              <AppButton
                title="Reload"
                variant="primary"
                onPress={() => console.log("Pressed!")}
              />
            </Link>
          </View>
        </>
      )}
      <FlatList
        data={capsules}
        keyExtractor={(item) => item.id}
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
      />
    </SafeAreaView>
  );
}

