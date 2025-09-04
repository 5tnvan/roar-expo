import { fallbackLogo } from "@/constants/Logos";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, View } from "react-native";

type AvatarProps = {
  uri: string;
  size?: number; // avatar size
  showTick?: boolean; // whether to show tick
  borderColor?: string; // border color, default blue
};

export const Avatar = ({
  uri,
  size = 48,
  showTick = false,
  borderColor = "#3B82F6", // default blue
}: AvatarProps) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={{ uri: uri ?? fallbackLogo }}
        style={{
          width: size - 4,
          height: size - 4,
          borderRadius: (size - 4) / 2,
        }}
      />
      {showTick && (
        <View
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            backgroundColor: "#3B82F6",
            borderRadius: 8,
            padding: 2,
          }}
        >
          <Ionicons name="checkmark" size={12} color="white" />
        </View>
      )}
    </View>
  );
};
