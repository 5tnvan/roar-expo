// components/NumberFormatter.tsx
import React from "react";
import { Text } from "react-native";

type NumberFormatterProps = {
  value: number;
  className?: string;
};

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
};

const NumberFormatter: React.FC<NumberFormatterProps> = ({ value, className }) => {
  return <Text className={className}>{formatNumber(value)}</Text>;
};

export default NumberFormatter;
