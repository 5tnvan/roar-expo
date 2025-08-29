import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable } from "react-native";

type SnapButtonProps = {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean; // add disabled prop
};

export default function SnapButton({ onPress, loading, disabled = false }: SnapButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const spin = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return; // prevent press when disabled
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
        onPress={disabled ? undefined : onPress} // disable press
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`px-6 py-4 rounded-full ${loading ? "bg-red-600" : disabled ? "bg-gray-800 opacity-25" : "bg-gray-700"}`} // change color if disabled
      >
        <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
          <Ionicons name="camera" size={20} color="white" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
