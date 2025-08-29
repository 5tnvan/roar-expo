import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable } from "react-native";
import { usePipecat } from "./PipeCat";

export default function CallButton() {
  const { start, leave, inCall, isLoading } = usePipecat();

  const pressScale = useRef(new Animated.Value(1)).current; // press feedback
  const pulse = useRef(new Animated.Value(1)).current; // pulse the button
  const iconRotate = useRef(new Animated.Value(0)).current; // rotate icon

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePress = () => {
    if (!inCall) {
      start(); // start joining call
    } else {
      leave(); // leave call
    }
  };

  // Pulse animation for button when loading
  useEffect(() => {
    pulse.stopAnimation();
    pulse.setValue(1);

    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isLoading, pulse]);

  // Tilt icon slightly when in call
  useEffect(() => {
    iconRotate.stopAnimation();
    iconRotate.setValue(0);

    if (inCall) {
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    }
  }, [inCall]);

  const iconRotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "140deg"], // slight tilt
  });

  const bgColor = isLoading
    ? "bg-amber-500"
    : inCall
      ? "bg-red-600"
      : "bg-green-600";

  return (
    <Animated.View style={{ transform: [{ scale: isLoading ? pulse : pressScale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`p-3.5 rounded-full items-center justify-center ${bgColor}`}
      >
        <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
          <Ionicons name="call-outline" size={24} color="white" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
