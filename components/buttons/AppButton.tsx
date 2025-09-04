// /components/ui/Button.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TextStyle, TouchableOpacity, useColorScheme, ViewStyle } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap; // optional Ionicons icon name
  iconPosition?: "left" | "right";        // default: left
  iconSize?: number;                      // default: 20
  iconColor?: string;                     // overrides text color
};

const AppButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  className = "",
  style,
  textStyle,
  disabled = false,
  icon,
  iconPosition = "left",
  iconSize = 20,
  iconColor,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  let bgClass = "";
  let textClass = "";
  let borderClass = "";

  switch (variant) {
    case "primary":
      bgClass = "bg-blue-600";
      textClass = "text-white";
      break;
    case "outline":
      bgClass = "bg-transparent";
      textClass = isDark ? "text-white" : "text-black";
      borderClass = "border border-gray-400";
      break;
    case "dark":
      bgClass = isDark ? "bg-zinc-800" : "bg-zinc-200";
      textClass = isDark ? "text-white" : "text-black";
      break;
  }

  let sizeClass = "";
  switch (size) {
    case "sm":
      sizeClass = "px-3 py-2 text-sm";
      break;
    case "md":
      sizeClass = "px-4 py-3 text-lg";
      break;
    case "lg":
      sizeClass = "px-5 py-4 text-xl";
      break;
  }

  const iconColorFinal = iconColor || (variant === "primary" ? "white" : isDark ? "white" : "black");

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${bgClass} ${borderClass} rounded-lg items-center justify-center flex-row ${sizeClass} ${className}`}
      style={style}
    >
      {icon && iconPosition === "left" && (
        <Ionicons name={icon} size={iconSize} color={iconColorFinal} className="mr-2" />
      )}
      <Text className={`${textClass}`} style={textStyle}>
        {title}
      </Text>
      {icon && iconPosition === "right" && (
        <Ionicons name={icon} size={iconSize} color={iconColorFinal} className="ml-2" />
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
