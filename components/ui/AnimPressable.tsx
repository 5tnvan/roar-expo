import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable } from "react-native";

type AnimPressableProps = {
  onPress: () => void;
  loading: boolean;
};

export default function AnimPressable({ onPress, loading }: AnimPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
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

  // Spin animation when loading
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spin.stopAnimation();
      spin.setValue(0);
    }
  }, [loading]);

  const spinInterpolate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`px-6 py-4 rounded-full ${loading ? "bg-red-600" : "bg-gray-600"}`}
      >
        <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
          <Ionicons name="camera" size={24} color="white" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
