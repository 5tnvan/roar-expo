import { usePipecat } from '@/components/providers/PipeCatProvider';
import { Capsule } from '@/types/types';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  useColorScheme,
  View,
  ViewToken
} from 'react-native';
import CapsuleCard2 from './cards/CapsuleCard2';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SPACING = 10;

interface InfiniteScrollProps {
  capsules: Capsule[];
  isLoading?: boolean;
  endReached?: boolean;
  fetchMore?: () => void;
  refetch?: () => void;
  handleToggleSub?: (ownerId: string, newSubState: boolean) => void;
}

export default function InfiniteScroll({
  capsules,
  isLoading = false,
  endReached = false,
  fetchMore,
  refetch,
  handleToggleSub,
}: InfiniteScrollProps) {

  //hooks
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { inCall, sendCapsule } = usePipecat();

  // variables
  const isDark = colorScheme === 'dark';
  const sidePadding = (width - CARD_WIDTH) / 2;

  // state
  const [activeIndex, setActiveIndex] = useState(0);

  // refs and states for pagination dots
  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

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
    <View className=''>
      {/* Pagination dots */}
      
      <FlatList
      className=''
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        data={capsules}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          alignItems: 'center',
        }}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH, marginHorizontal: SPACING / 2 }}>
            <CapsuleCard2
              capsule={item}
              onReadWithAI={handleReadWithAI}
              onToggleSub={(newState: boolean) => handleToggleSub?.(item.owner.id, newState)}
            />
          </View>
        )}
        snapToInterval={CARD_WIDTH + SPACING}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        onEndReached={() => {
          if (!endReached && !isLoading) fetchMore?.();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => {
          if (isLoading && capsules.length > 0) {
            return <ActivityIndicator size="small" className="my-4" />;
          } else if (!isLoading && endReached) {
            return (
              <></>
              // <View className="flex-row rounded-lg px-4 py-2 bg-white dark:bg-zinc-800 items-center justify-center text-center" style={{ width: CARD_WIDTH, height: CARD_WIDTH, marginHorizontal: SPACING / 2 }}>
              //   <Text className="text-center text-gray-500">You’ve reached the end.</Text>
              // </View>
            );
          } else {
            return null;
          }
        }}
      />
      <View className="flex-row justify-center items-center my-4">
        {capsules.map((_, i) => (
          <View
            key={i}
            className={`h-2 w-2 mx-1 rounded-full ${i === activeIndex
                ? isDark
                  ? 'bg-white'
                  : 'bg-green-500'
                : 'bg-zinc-400'
              }`}
          />
        ))}
      </View>
      
    </View>
  );
}
