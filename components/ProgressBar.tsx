import React from "react";
import { View } from "react-native";

interface ProgressBarProps {
  progress: number; // value between 0 and 1
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = "#E5E7EB", // gray-200
  fillColor = "#1d4ed8", // blue-700
}) => {
  return (
    <View
      style={{
        width: "100%",
        height,
        borderRadius: height / 2,
        backgroundColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
          height: "100%",
          backgroundColor: fillColor,
        }}
      />
    </View>
  );
};

export default ProgressBar;
