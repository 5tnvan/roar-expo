import AppButton from '@/components/buttons/AppButton';
import CapsuleCard from '@/components/cards/CapsuleCard';
import { usePipecat } from '@/components/providers/PipeCatProvider';
import { ThemedText } from '@/components/template/ThemedText';
import { useLikedCapsules } from '@/hooks/useLikeCapsules.';
import { Capsule } from '@/types/types';
import { Link, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
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
  const { inCall, sendCapsule } = usePipecat();

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
    <SafeAreaView
      edges={['right', 'left']}
      className={`py-2 flex-1 ${isDark ? "bg-black" : "bg-zinc-50"}`}
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
        className=''
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
              <ThemedText className="text-center text-gray-500 my-4 opacity-80">
                You’ve reached the end
              </ThemedText>
            );
          } else {
            return null;
          }
        }}
      />)}
      
    </SafeAreaView>
  );
}

