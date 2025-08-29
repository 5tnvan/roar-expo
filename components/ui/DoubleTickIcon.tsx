import React from "react";
import Svg, { Path } from "react-native-svg";

export default function DoubleTickIcon({
  size = 24,
  color = "#000",
  style,
}: {
  size?: number;
  color?: string;
  style?: object;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Path
        d="M5 13l3 3 5-5"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 13l3 3 7-7"
        stroke={color}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
