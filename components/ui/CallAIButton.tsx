import { BlurView } from "expo-blur";
import React from "react";
import { Text, TouchableOpacity, useColorScheme } from "react-native";
import RoarAvatar from "./RoarAvatar";

type CallAIButtonProps = {
  onPress: () => void;
  size?: number;
  readMinutes?: number;
};

export default function CallAIButton({ onPress, size = 15, readMinutes }: CallAIButtonProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 items-center mx-auto`}
    ><BlurView intensity={50} tint="light" className="flex-1 flex-row justify-center items-center gap-2 px-4 py-3">
      <RoarAvatar size={size} onPress={() => {}} />
      <Text
        className={`text-xl opacity-100 ${
          isDark ? "text-white" : "text-white"
        }`}
      >
        <Text className="opacity-100 ">{`Call to reveal `}</Text>
        <Text className="opacity-100 text-green-200">{readMinutes}m</Text>
      </Text>
    
      </BlurView>
    </TouchableOpacity>
  );
}
