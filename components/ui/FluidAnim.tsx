import React, { useEffect } from "react";
import { ImageBackground, useColorScheme, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

export default function BreathingBackground({ children }: { children?: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.03, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 overflow-hidden">
      <AnimatedImageBackground
        source={isDark ? require("../../assets/images/Green3.png") : require("../../assets/images/Green26.png")}
        className="flex-1 justify-center items-center w-full h-full"
        style={animatedStyle}
        resizeMode="cover"
      >
        {children}
      </AnimatedImageBackground>
    </View>
  );
}
