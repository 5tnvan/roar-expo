import React, { useEffect, useRef } from "react";
import { Animated, Dimensions } from "react-native";

export const SlideRightView: React.FC<{ show: boolean; children: React.ReactNode }> = ({ show, children }) => {
  const screenWidth = Dimensions.get("window").width;
  const translateX = useRef(new Animated.Value(show ? 0 : screenWidth)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: show ? 0 : screenWidth, // 0 = visible, screenWidth = off-screen right
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [show, translateX, screenWidth]);

  return (
    <Animated.View
      style={{
        position: "absolute", // crucial for sliding
        width: "100%",
        transform: [{ translateX }],
      }}
    >
      {children}
    </Animated.View>
  );
};
