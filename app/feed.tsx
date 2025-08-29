import { Avatar } from '@/components/Avatar';
import CapsuleCard from '@/components/CapsuleCard';
import { usePipecat } from '@/components/pipecat/PipeCat';
import { ThemedText } from '@/components/ThemedText';
import AppButton from '@/components/ui/Button';
import { useCapsulesBySub } from '@/hooks/useCapsulesBySub';
import { useAuth } from '@/services/providers/AuthProvider';
import { Profile } from '@/types/types';
import { fetchSubs } from '@/utils/supabase/crudSub';
import { Link, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Feed() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { user } = useAuth();
  const { isLoading, capsules, handleToggleSub, fetchMore } = useCapsulesBySub(user?.id || "");
  const navigation = useNavigation();
  const { sendCapsule } = usePipecat();

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
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className={`flex-1 ${isDark ? "bg-neutral-800" : "bg-neutral-300"}`}>
      
      {/* Horizontal scroll of subscriptions */}
      {subscriptions.length > 0 && (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          className={`p-4 ${isDark ? "bg-black" : "bg-white"}`}
          renderItem={({ item }) => (
            <Link
            href={`/profile/${item.id}`}
              className="w-16 h-16"
              
            >
              <Avatar uri={item.avatar_url} size={50} showTick />
            </Link>
          )}
        />
      )}

      {/* Empty state when no subscriptions */}
      {!isLoading && capsules.length === 0 && subscriptions.length === 0 && (
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

      {/* Capsule feed */}
      <FlatList
        data={capsules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CapsuleCard capsule={item} onReadWithAI={handleReadWithAI} onToggleSub={handleToggleSub} />
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
