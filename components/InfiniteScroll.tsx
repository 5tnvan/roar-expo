import { usePipecat } from '@/components/providers/PipeCatProvider';
import { useAllCapsules } from '@/hooks/useAllCapsules';
import { Capsule } from '@/types/types';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  useColorScheme,
  View,
  ViewToken
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CapsuleCard2 from './cards/CapsuleCard2';

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8; // smaller than screen for peeking
const SPACING = 10;

export default function InfiniteScroll() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { isLoading, capsules, fetchMore, handleToggleSub } = useAllCapsules();
  const router = useRouter();
  const { sendCapsule } = usePipecat();

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleReadWithAI = (capsule: Capsule) => {
    sendCapsule(capsule);
    router.push("(tabs)");
  };

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const sidePadding = (width - CARD_WIDTH) / 2;

  return (
    <SafeAreaView
      edges={['right', 'bottom', 'left']}
      className={`flex-1 justify-center`}
    >
      {!isLoading && capsules && capsules.length > 0 && (
        <>
        <FlatList
        ref={flatListRef}
        data={capsules}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + SPACING}
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          alignItems: "center",
        }}
        renderItem={({ item, index }) => (
          <View style={{ width: CARD_WIDTH, marginHorizontal: SPACING / 2 }}>
            <CapsuleCard2
              capsule={item}
              onReadWithAI={handleReadWithAI}
              onToggleSub={handleToggleSub}
            />
          </View>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`} // ensures uniqueness
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
      />

      {/* Pagination dots */}
      <View className="flex-row justify-center items-center mt-2 mb-4">
        {capsules.map((_, i) => (
          <View
            key={i}
            className={`h-2 w-2 mx-1 rounded-full ${
              i === activeIndex
                ? isDark
                  ? "bg-white"
                  : "bg-green-500"
                : "bg-zinc-400"
            }`}
          />
        ))}
      </View>
        </>
      )}
      
    </SafeAreaView>
  );
}
