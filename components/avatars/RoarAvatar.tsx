import React, { useRef } from "react";
import { Animated, Image, TouchableOpacity, useColorScheme } from "react-native";

type CallButtonProps = {
  onPress: () => void;
  size?: number; // optional size prop
};

export default function RoarAvatar({ onPress, size = 70 }: CallButtonProps) {
  const colorScheme = useColorScheme();
  const pulse = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const combinedScale = Animated.add(new Animated.Value(1), pulse);

  return (
    <Animated.View
      style={{
        transform: [{ scale: combinedScale }],
      }}
      className=""
    >
      <TouchableOpacity
        onPress={handlePress}
        className="border dark:border border-green-300 dark:border-lime-200/80 rounded-full"
      >
        <Image
          source={require("../../assets/logo/playground.png")}
          className="rounded-full opacity-90"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            resizeMode: "contain",
          }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
