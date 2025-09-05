import { Link } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, useColorScheme } from "react-native";
import { usePipecat } from "../providers/PipeCatProvider";

type BotVisualizerProps = {
  size?: number;     // diameter of the blob
  logoSize?: number; // size of the logo inside
};

export default function BotVisualizer({ size = 40, logoSize = 35 }: BotVisualizerProps) {
  const { inCall } = usePipecat();
  const colorScheme = useColorScheme(); // "light" or "dark"

  const baseScale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // Base gentle breathing animation
  useEffect(() => {
    const baseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(baseScale, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(baseScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    baseLoop.start();
    return () => baseLoop.stop();
  }, [baseScale]);

  const combinedScale = Animated.add(baseScale, pulse);
  const blobColor = colorScheme === "dark" ? "#ffffff" : inCall ? "#ffffff" : "#e0e0e0";

  return (
    <Link href="/bot">
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: blobColor,
        transform: [{ scale: combinedScale }],
        shadowColor: blobColor,
        shadowOpacity: 0.6,
        shadowRadius: size * 0.25, // shadow scales with size
        shadowOffset: { width: 0, height: 0 },
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className=""
    >
      <Image
        source={require('../../assets/logo/playground.png')}
        style={{ width: logoSize, height: logoSize, resizeMode: 'contain', borderRadius: logoSize / 2 }}
      />
    </Animated.View>
    </Link>
  );
}
