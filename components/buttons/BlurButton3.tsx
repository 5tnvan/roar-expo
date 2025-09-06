import React from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import RoarAvatar from "../avatars/RoarAvatar";

type BlurButton3Props = {
  label: string;
  onPress: () => void;
  size?: number;
};

export default function BlurButton3({ label, onPress, size = 15 }: BlurButton3Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
      <Pressable
        onPress={onPress}
        className="border border-green-800/40 dark:border-zinc-50/40 rounded-full"
      >
        <View
          className="flex-row justify-center items-center gap-1 p-4"
        >
          <RoarAvatar size={size} onPress={() => {}} />
          <Text className="text-sm font-semibold text-green-800 dark:text-white uppercase">
            {label}
          </Text>
        </View>
      </Pressable>
  );
}
