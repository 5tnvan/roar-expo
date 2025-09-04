import { useAuth } from "@/services/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Alert, Animated, Easing, Pressable } from "react-native";
import { usePipecat } from "../providers/PipeCatProvider";

export default function CallButton() {
  const { start, leave, inCall, isLoading } = usePipecat();

  const scale = useRef(new Animated.Value(1)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  const { isAuthenticated } = useAuth();

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!isLoading) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (isAuthenticated) {
      if (!inCall) start();
      else leave();
    } else {
      Alert.alert("Sign in to continue")
    }

  };

  // Icon rotation when in call
  useEffect(() => {
    iconRotate.setValue(0);
    if (inCall) {
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [inCall]);

  const iconRotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "140deg"],
  });

  const bgColor = isLoading
    ? "bg-amber-500"
    : inCall
      ? "bg-red-600"
      : "bg-green-600";

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading}
        className={`p-3.5 rounded-full items-center justify-center ${bgColor}`}
      >
        <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
          <Ionicons name="call-outline" size={24} color="white" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
