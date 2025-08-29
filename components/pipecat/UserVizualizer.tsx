import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image } from "react-native";
import { usePipecat } from "./PipeCat";

export default function UserVisualizer({ avatarUrl }: { avatarUrl: string }) {
  const { audioLevel } = usePipecat();

  const baseScale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // Base gentle breathing
  useEffect(() => {
    const baseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(baseScale, {
          toValue: 1.03,
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

  // Reactive pulse with local audioLevel
  useEffect(() => {
    if (audioLevel === 1) {
      pulseAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 0.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.current.start();
    } else {
      if (pulseAnimation.current) pulseAnimation.current.stop();
      Animated.timing(pulse, {
        toValue: 0,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [audioLevel, pulse]);

  const combinedScale = Animated.add(baseScale, pulse);

  return (
    <Animated.View
      style={{
        width: 40,
        height: 40,
        borderRadius: 40,
        backgroundColor: "#e0e0e0",
        transform: [{ scale: combinedScale }],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: 35, height: 35, borderRadius: 22 }}
      />
    </Animated.View>
  );
}