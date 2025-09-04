import AppButton from '@/components/buttons/AppButton';
import CapsuleCard from '@/components/cards/CapsuleCard';
import { usePipecat } from '@/components/providers/PipeCatProvider';
import { ThemedText } from '@/components/template/ThemedText';
import BottomMenu from '@/components/ui/BottomMenu';
import { useLikedCapsules } from '@/hooks/useLikeCapsules.';
import { Capsule } from '@/types/types';
import { Link, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Approved() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  //context
  const { isLoading, capsules, handleToggleSub, fetchMore, endReached, refetch } = useLikedCapsules();
  const router = useRouter();
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

      {!isLoading && capsules.length === 0 && (
        <>
          <ThemedText className="mt-5 text-gray-500 text-center">
            There are no messages.
          </ThemedText>
          <View className="w-full items-center my-4">
            <Link href="/explore" asChild>
              <AppButton
                title="Explore"
                variant="primary"
                onPress={() => console.log("Pressed!")}
              />
            </Link>
          </View>
        </>
      )}{capsules.length !== 0 && (
      <FlatList
        className='py-2'
        data={capsules}
        keyExtractor={(item, index) => `${item.id}-${index}`} // unique key
        renderItem={({ item }) => (
          <CapsuleCard
            capsule={item}
            onReadWithAI={handleReadWithAI}
            onToggleSub={handleToggleSub}
          />
        )}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        onRefresh={refetch}
        refreshing={isLoading}
        ListFooterComponent={() => {
          if (isLoading && capsules.length > 0) {
            return <ActivityIndicator size="small" className="my-4" />;
          } else if (!isLoading && endReached) {
            return (
              <ThemedText className="text-center text-gray-500 my-4">
                You’ve reached the end
              </ThemedText>
            );
          } else {
            return null;
          }
        }}
      />)}
      <BottomMenu />
    </SafeAreaView>
  );
}

