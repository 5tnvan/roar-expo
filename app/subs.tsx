import { Avatar } from '@/components/avatars/Avatar';
import AppButton from '@/components/buttons/AppButton';
import CapsuleCard from '@/components/cards/CapsuleCard';
import { usePipecat } from '@/components/providers/PipeCatProvider';
import { ThemedText } from '@/components/template/ThemedText';
import BottomMenu from '@/components/ui/BottomMenu';
import { useCapsulesBySub } from '@/hooks/useCapsulesBySub';
import { useAuth } from '@/services/providers/AuthProvider';
import { Profile } from '@/types/types';
import { fetchSubs } from '@/utils/supabase/crudSub';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Subs() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { user } = useAuth();
  const { isLoading, capsules, handleToggleSub, fetchMore, refetch, endReached } = useCapsulesBySub(user?.id || "");
  const { sendCapsule } = usePipecat();
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Profile[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Fetch subscriptions
  const loadSubs = async () => {
    if (!user?.id) return;
    setLoadingSubs(true);
    const subs = await fetchSubs(user.id);
    if (subs && Array.isArray(subs)) {
      setSubscriptions(subs); // only set if it's an array
    } else {
      setSubscriptions([]); // fallback to empty array
    }
    setLoadingSubs(false);
  };

  useEffect(() => {
    loadSubs();
  }, [user]);

  const handleReadWithAI = (capsule: any) => {
    sendCapsule(capsule);
    router.push("(tabs)");
  };

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>

      <View className='border-b border-zinc-500/20 mb-2'>
        {/* Horizontal scroll of subscriptions */}
        {subscriptions.length > 0 && (
          <FlatList
            data={subscriptions}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            className={`p-2 ${isDark ? "bg-black" : "bg-white"}`}
            renderItem={({ item }) => (
              <Link
                href={`/profile/${item.id}`}
                className="w-14 h-14 mr-1"
              >
                <Avatar uri={item.avatar_url} size={50} showTick />
              </Link>
            )}
          />
        )}
      </View>


      {/* Empty state when no subscriptions */}
      {!isLoading && subscriptions.length === 0 && (
        <>
          <ThemedText className="mt-5 text-gray-500 text-center">
            You are not subscribed to anyone yet.
          </ThemedText>
          <View className="w-full items-center my-4">
            <Link href="/explore" asChild>
              <AppButton
                title="Subscribe +"
                variant="primary"
                onPress={() => console.log("Pressed!")}
              />
            </Link>
          </View>
        </>
      )}

      {!isLoading && subscriptions.length > 0 && capsules.length === 0 && (
        <>
          <ThemedText className="mt-5 text-gray-500 text-center">
            There are no messages yet.
          </ThemedText>
          <View className="w-full items-center my-4">
            <Link href="/explore" asChild>
              <AppButton
                title="Subscribe +"
                variant="primary"
                onPress={() => console.log("Pressed!")}
              />
            </Link>
          </View>
        </>
      )}
      
      {/* Capsule feed */}
      {capsules.length !== 0 && (
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
        />
      )}
<BottomMenu />

    </SafeAreaView>
  );
}
