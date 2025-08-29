import React, { useRef } from "react";
import { Animated, Pressable } from "react-native";
import { ThemedText } from "../ThemedText";
import RoarAvatar from "./RoarAvatar"; // your avatar component

type AssistantButtonProps = {
  label?: string;
  onPress: () => void;
};

export default function AssistantButton({
  label = "Call my assistant",
  onPress,
}: AssistantButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

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
        className="flex flex-row items-center gap-2 rounded-full px-4 py-2 justify-center 
 border border-green-500"
      >
        <RoarAvatar size={20} onPress={() => {}} />
        <ThemedText className="text-white">{label}</ThemedText>
      </Pressable>
    </Animated.View>
  );
}
