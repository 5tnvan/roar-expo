import { dancingPills } from "@/constants/DancingPills";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";

export default function PillButton() {
  const scale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  // Pick a random pill only once per mount
  const randomPillRef = useRef(
    dancingPills[Math.floor(Math.random() * dancingPills.length)].image
  );
  const randomPill = randomPillRef.current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    router.push("/create_capsule");
  };

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={{ transform: [{ scale }] }}
        className="w-16 h-20 rounded-full border border-lime-500 overflow-hidden items-center justify-center"
      >
        <Image
          source={{ uri: randomPill }}
          className="w-full h-full rounded-full"
        />

        {/* + overlay */}
        <View className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <Text className="text-lime-500 text-2xl">+</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}
