import React, { useRef } from "react";
import { Animated, Pressable, Text, useColorScheme, View } from "react-native";
import { Avatar } from "../avatars/Avatar";
import RoarAvatar from "../avatars/RoarAvatar";

type AssistantButtonProps = {
  label?: string;
  onPress: () => void;
  size?: number; // height and avatar size
  avatarUri?: string; // optional avatar image
};

export default function AssistantButton({
  label = "Call my assistant",
  onPress,
  size = 40,
  avatarUri,
}: AssistantButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const avatarSize = size * 0.4; // roughly 40% of button height

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="flex-row items-center gap-2 rounded-full justify-center border overflow-hidden relative"
        style={{
          height: size,
          borderColor: isDark ? "#22c55e" : "#16a34a",
          paddingHorizontal: size * 0.3,
        }}
      >
        {avatarUri ? (
          <Avatar uri={avatarUri} size={25} borderColor="green" />
        ) : (
          <RoarAvatar size={avatarSize} onPress={() => {}} />
        )}
        <View className="flex flex-row gap-1 justify-center items-center">
        <Text className="text-lg text-green-600 font-sans font-semibold tracking-wide">HEY</Text>
        <Text className="text-lg text-black dark:text-white">
          {label}
          </Text></View>
      </Pressable>
    </Animated.View>
  );
}
