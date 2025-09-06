import { router } from 'expo-router';
import { ActivityIndicator, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CapsuleCard from '../components/cards/CapsuleCard';
import { usePipecat } from '../components/providers/PipeCatProvider';
import { ThemedText } from '../components/template/ThemedText';
import { ThemedView } from '../components/template/ThemedView';
import { useExploreCapsules } from '../hooks/useExploreCapsules';
import { Capsule } from '../types/types';

export default function Explore() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    activeTab,
    setActiveTab,
    capsules,
    fetchMore,
    refetch,
    handleToggleSub,
    endReached,
    isLoading
  } = useExploreCapsules();

  const { sendCapsule } = usePipecat();

  const handleReadWithAI = (capsule: Capsule) => {
    sendCapsule(capsule);
    router.push("/");
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (!endReached && !isLoading) {
      fetchMore();
    }
  };

  const tabs: { label: string; value: 'similar' | 'new' | 'popular' }[] = [
    { label: 'Similar', value: 'similar' },
    { label: 'New', value: 'new' },
    { label: 'Popular', value: 'popular' }
  ];

  return (
    <SafeAreaView edges={['right', 'left']} className={`flex-1 ${isDark ? "bg-black" : "bg-zinc-100"}`}>
      {/* Tabs */}
      <ThemedView className="flex-row justify-around border-b border-gray-400/20">
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.value}
            onPress={() => setActiveTab(tab.value)}
            className={`py-3 ${activeTab === tab.value ? "border-b-2 border-blue-500" : ""}`}
          >
            <ThemedText className={`${activeTab === tab.value ? "text-blue-500 font-bold" : "text-gray-500"}`}>
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Loading */}
      {isLoading && capsules.length === 0 && (
        <ActivityIndicator size="large" className="mt-5" />
      )}

      {/* Empty state */}
      {!isLoading && capsules.length === 0 && (
        <ThemedText className="mt-5 text-gray-500 text-center">
          No messages in this tab.
        </ThemedText>
      )}

      {/* Capsule list */}
      {capsules.length > 0 && (
        <FlatList
          data={capsules}
          keyExtractor={(item,index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <CapsuleCard
              capsule={item}
              onReadWithAI={handleReadWithAI}
              onToggleSub={handleToggleSub}
            />
          )}
          className='py-2'
          refreshing={isLoading}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator size="small" className="my-4" />
            ) : endReached ? (
              <ThemedText className="text-center my-4 text-gray-400 opacity-80">
                {`You've reached the end.`}
              </ThemedText>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
