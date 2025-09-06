import { BlurView } from "expo-blur";
import React, { useRef } from "react";
import { Animated, Pressable, Text, useColorScheme } from "react-native";
import RoarAvatar from "../avatars/RoarAvatar";

type BlurButton1Props = {
  onPress: () => void;
  size?: number;
  readMinutes?: number;
};

export default function BlurButton1({ onPress, size = 15, readMinutes }: BlurButton1Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="flex-1 items-center mx-auto rounded-full overflow-hidden border border-zinc-50/40"
      >
        <BlurView
          intensity={50}
          tint={isDark ? "dark" : "dark"}
          experimentalBlurMethod="dimezisBlurView"
          className="flex-row justify-center items-center gap-2 p-4 w-fit"
        >
          <RoarAvatar size={size} onPress={() => {}} />
          <Text className="text-sm font-semibold text-white dark:text-white uppercase">
            {`Hey Roar `}
            <Text className="text-green-200">{readMinutes}m</Text>
          </Text>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}
