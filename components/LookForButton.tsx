import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

type AnimatedToggleButtonProps = {
  active: boolean;
  onPress: () => void;
  loading?: boolean; // new prop
};

export default function LookForButton({ active, onPress, loading = false }: AnimatedToggleButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate background color when `active` changes
  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: active ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [active]);

  // Pulse animation for loading state
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1); // reset scale when not loading
    }
  }, [loading]);

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

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#4b5563", "#2563eb"], // gray-600 → blue-600
  });

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, pulseAnim) }] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={{
            backgroundColor,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 9999,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="search" size={20} color="white" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
