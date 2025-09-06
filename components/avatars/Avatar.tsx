import { fallbackLogo } from "@/constants/Logos";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, View } from "react-native";

type AvatarProps = {
  uri?: string;
  size?: number; // avatar size
  showTick?: boolean; // whether to show tick
  showNotif?: boolean; 
  plan?: string; // '' or 'unlimited'
};

export const Avatar = ({
  uri,
  size = 48,
  showTick = false,
  showNotif = false,
  plan = '', // default to basic
}: AvatarProps) => {
  const borderColorClass = plan === 'unlimited' ? 'border-yellow-500' : 'border-teal-400';
  const tickBgColorClass = plan === 'unlimited' ? 'bg-yellow-500' : 'bg-teal-400';

  return (
    <View
      className={`items-center justify-center border-2 ${borderColorClass}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    >
      <Image
        source={{ uri: uri ?? fallbackLogo }}
        className="rounded-full"
        style={{
          width: size - 4,
          height: size - 4,
          borderRadius: (size - 4) / 2,
        }}
      />

      {showTick && (
        <View className={`absolute bottom-0 right-0 ${tickBgColorClass} rounded-full p-0.5`}>
          <Ionicons name="checkmark" size={12} color="white" />
        </View>
      )}

      {showNotif && (
        <View className="w-3 h-3 bg-red-500 rounded-full absolute top-0 right-0 border border-white" />
      )}
    </View>
  );
};
