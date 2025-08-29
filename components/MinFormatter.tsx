import { ThemedText } from "@/components/ThemedText";
import React from "react";

interface MinFormattedProps {
  seconds: number;
}

export const MinFormatter: React.FC<MinFormattedProps> = ({ seconds }) => {
  // Round up to 1 minute if less than 60 seconds
  const totalMinutes = Math.max(1, Math.floor(seconds / 60));

  let formatted = "";
  if (totalMinutes >= 1_000_000_000) {
    formatted = (totalMinutes / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "b mins";
  } else if (totalMinutes >= 1_000_000) {
    formatted = (totalMinutes / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m mins";
  } else if (totalMinutes >= 1_000) {
    formatted = (totalMinutes / 1_000).toFixed(1).replace(/\.0$/, "") + "k mins";
  } else {
    formatted = totalMinutes + " mins";
  }

  return <ThemedText className="opacity-80">{formatted}</ThemedText>;
};
