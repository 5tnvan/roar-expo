import { BlurView } from "expo-blur";
import React from "react";
import { Text, TouchableOpacity, useColorScheme } from "react-native";
import RoarAvatar from "../avatars/RoarAvatar";

type BlurButtonProps = {
  onPress: () => void;
  size?: number;
  readMinutes?: number;
};

export default function BlurButton({ onPress, size = 15, readMinutes }: BlurButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 items-center mx-auto rounded-full overflow-hidden`}
    ><BlurView
      intensity={isDark ? 50 : 50}
      tint={isDark ? "dark" : "light"}
      experimentalBlurMethod={"dimezisBlurView"}
      className="flex-1 flex-row justify-center items-center gap-1 p-4 w-fit">
        <RoarAvatar size={size} onPress={() => { }} />
        <Text
          className={`text-xl opacity-100 text-zinc-100 dark:text-white`}
        >
          <Text className="opacity-100 font-semibold font-sans uppercase text-sm">{`Hey Roar `}</Text>
          <Text className="opacity-100 font-semibold font-sans uppercase text-sm text-green-500 dark:text-green-200">{readMinutes}m</Text>
        </Text>

      </BlurView>
    </TouchableOpacity>
  );
}
