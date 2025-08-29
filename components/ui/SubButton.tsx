import React, { useState } from "react";
import { Animated, useColorScheme } from "react-native";
import AppButton from "./Button";

type SubscribeButtonProps = {
  subscribed?: boolean;
  size?: "sm" | "md" | "lg";
  onPress: () => void;
};

export default function SubscribeButton({
  subscribed = false,
  size = "md",
  onPress,
}: SubscribeButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [anim] = useState(new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: anim }] }}>
  <AppButton
    onPress={handlePress}
    variant={subscribed ? "outline" : "primary"}
    size="md"
    className={`rounded-full ${subscribed ? "opacity-60" : ""}`}
    title={subscribed ? "Subscribed ✓" : "Subscribe +"}
  />
</Animated.View>

  );
}
