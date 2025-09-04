import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Animated, Pressable } from "react-native";

type SnapButtonProps = {
  disabled?: boolean;
};

export default function AIConvoButton({ disabled = false }: SnapButtonProps) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={disabled ? undefined : () => router.push("/convos")}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`p-4 rounded-full bg-gray-200`}
      >
        <Animated.View>
          <Ionicons name="chatbox-ellipses" size={20} color="#374151" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
