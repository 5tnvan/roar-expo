import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

type CameraControlButtonProps = {
  active?: boolean; // For camera on/off toggle
  onPress: () => void;
  loading?: boolean;
  iconOn?: keyof typeof Ionicons.glyphMap;
  iconOff?: keyof typeof Ionicons.glyphMap;
  isToggle?: boolean; // true if button switches icons
  style?: object;
};

export default function CameraControlButton({
  active = false,
  onPress,
  loading = false,
  iconOn,
  iconOff,
  isToggle = false,
}: CameraControlButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate background color when `active` changes
  useEffect(() => {
    if (isToggle) {
      Animated.timing(bgAnim, {
        toValue: active ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [active, isToggle]);

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
      pulseAnim.setValue(1);
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
    outputRange: ["#374151", "#2563eb"], // gray → blue
  });

  const iconName = isToggle ? (active ? iconOn : iconOff) : iconOn;

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, pulseAnim) }] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={{
            backgroundColor,
            padding: 14,
            borderRadius: 9999,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {iconName && <Ionicons name={iconName} size={22} color="white" />}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
