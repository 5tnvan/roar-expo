import React, { useEffect, useRef } from "react";
import { FlatList, Text, View } from "react-native";
import RoarAvatar from "../avatars/RoarAvatar";
import DoubleTickIcon from "../DoubleTickIcon";
import { usePipecat } from "../providers/PipeCatProvider";

export default function TranscriptionLog() {
  const { transcriptionLog } = usePipecat();
  const flatListRef = useRef<FlatList>(null);

  // Only keep bot messages with valid text
  const botMessages = transcriptionLog.filter(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      entry.type === "bot" &&
      typeof entry.text === "string"
  );

  const renderItem = ({ item }: { item: any }) => {
  const text = item.text.replace(/[\r\n]+/g, " ").trim();
  const timestamp = item.timestamp
    ? new Date(item.timestamp).toLocaleTimeString()
    : "";

  return (
    <View className="mt-1 self-end bg-white/80 rounded-lg px-3 py-2">
      {/* Message text */}
      <Text className="font-normal text-black">{text}</Text>

      {/* Bottom row: timestamp, tick, avatar */}
      <View className="flex flex-row items-center justify-end mt-1">
        <Text className="text-xs text-gray-400">{timestamp}</Text>
        <DoubleTickIcon size={20} color="green" />
        <RoarAvatar size={20} onPress={() => console.log("avatar pressed")} />
      </View>
    </View>
  );
};



  // Scroll to bottom after new messages
  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [botMessages]);

  return (
    <View className="w-full max-h-28 pl-2">
      {botMessages.length > 0 && (
        <FlatList
          ref={flatListRef}
          data={botMessages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 4 }}
        />
      )}
    </View>
  );
}
