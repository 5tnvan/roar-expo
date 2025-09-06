import React from "react";
import { Pressable, Text, View } from "react-native";
import RoarAvatar from "../avatars/RoarAvatar";

type BlurButton2Props = {
  onPress: () => void;
  size?: number;
  readMinutes?: number;
};

export default function BlurButton2({ onPress, size = 15, readMinutes }: BlurButton2Props) {
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
            {`Hey Roar `}
            <Text className="text-green-500 dark:text-green-200">{readMinutes}m</Text>
          </Text>
        </View>
      </Pressable>
  );
}
