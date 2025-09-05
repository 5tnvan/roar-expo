import { Profile, TranscriptionEntry } from "@/types/types";
import React from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { Avatar } from "../avatars/Avatar";
import RoarAvatar from "../avatars/RoarAvatar";
import DoubleTickIcon from "../DoubleTickIcon";

interface TranscriptProps {
  log: TranscriptionEntry[];
  caller?: Profile;
  callee?: Profile;
}

export default function TranscriptionLog3({ log, caller, callee }: TranscriptProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 8 }} showsVerticalScrollIndicator={false} className="min-w-[100%]">
      {log.map((entry, idx) => {
        const isUser = entry.type === "user";

        return (
          <View
            key={idx}
            className={`
              ${isUser ? "self-start !bg-green-500/50" : "self-end opacity-80"}
              ${isDark ? "bg-zinc-900/80" : "bg-zinc-100/50"}
              rounded-xl px-3 py-2 my-1 max-w-[80%]
            `}
          >
            {/* Message text */}
            <Text className="text-md text-black dark:text-white mb-1">{entry.text}</Text>

            {/* Bottom row: timestamp, tick, avatar */}
            <View
              className={`
                flex-row items-center gap-1
                ${isUser ? "justify-start" : "justify-end"}
              `}
            >
              {isUser && <Avatar
                  uri={caller?.avatar_url || ""}
                  size={20}
                  borderColor="green"
                />}
                <View className="flex-row items-center">
                  <Text className="text-xs text-black/50 dark:text-white/50">
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>

              <DoubleTickIcon size={16} color="green" />
                </View>
              

              {!isUser && <View className="flex flex-row opacity-55"><RoarAvatar size={20} onPress={() => {}} /><Avatar
                  uri={callee?.avatar_url || ""}
                  size={20}
                  borderColor="green"
                /></View>}
              
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
