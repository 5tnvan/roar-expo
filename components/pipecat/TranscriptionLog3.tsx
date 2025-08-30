import { TranscriptionEntry } from "@/types/types";
import React from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { ThemedText } from "../ThemedText";
import DoubleTickIcon from "../ui/DoubleTickIcon";
import RoarAvatar from "../ui/RoarAvatar";

interface TranscriptProps {
  log: TranscriptionEntry[];
}

export default function TranscriptionLog3({ log }: TranscriptProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <ScrollView contentContainerClassName="" showsVerticalScrollIndicator={false}>
      {log.map((entry, idx) => {
        const isUser = entry.type === "user";

        return (
          <View
            key={idx}
            className={`
              ${isUser ? "self-start" : "self-end"}
              ${!isUser ? "opacity-50" : ""}
              ${isDark ? "bg-gray-800" : "bg-gray-300"}
              rounded-xl px-3 py-2 my-1 max-w-[80%]
            `}
          >
            {/* Message text */}
            <ThemedText>{entry.text}</ThemedText>

            {/* Bottom row: timestamp, tick, avatar */}
            <View
              className={`
                flex-row items-center mt-1
                ${isUser ? "justify-start" : "justify-end"}
              `}
            >

              <Text className="text-sm text-black dark:text-white">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <DoubleTickIcon size={16} color="green" />
              {!isUser && <RoarAvatar size={20} onPress={() => console.log("avatar pressed")} />}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
