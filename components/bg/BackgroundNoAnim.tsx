import React from "react";
import { ImageBackground, useColorScheme, View } from "react-native";

export default function BackgroundNoAnim({ children }: { children?: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 overflow-hidden">
      <ImageBackground
        source={
          isDark
            ? require("../../assets/bg/bg-dark.jpg")
            : require("../../assets/bg/bg-light.png")
        }
        className="flex-1 justify-center items-center w-full h-full"
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    </View>
  );
}
