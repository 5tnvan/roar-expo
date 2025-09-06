import { useAuth } from "@/services/providers/AuthProvider";
import { insertCapsuleComment } from "@/utils/supabase/crudCapsuleComments";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "../avatars/Avatar";
import DoubleTickIcon from "../DoubleTickIcon";
import { usePipecat } from "../providers/PipeCatProvider";

export default function TranscriptionLog2() {
  const { transcriptionLog, openCapsule } = usePipecat();
  const flatListRef = useRef<FlatList>(null);
  const { profile } = useAuth();

  // Only keep user messages with valid text
  const userMessages = transcriptionLog.filter(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      entry.type === "user" &&
      typeof entry.text === "string"
  );

  const renderItem = ({ item }: { item: any }) => {
    const text = item.text.replace(/[\r\n]+/g, " ").trim();
    const timestamp = item.timestamp
      ? new Date(item.timestamp).toLocaleTimeString()
      : "";
  const handleSendComment = async (text: string) => {
    try {
      await insertCapsuleComment(openCapsule?.capsule.id || '', profile?.id || '', text);
      Alert.alert("Comment posted!");
    } catch (err) {
      console.error("Error inserting comment:", err);
      Alert.alert("Failed to send comment");
    }
  };

    return (
      <TouchableOpacity onPress={() => handleSendComment(text)} className="mt-1 px-3 py-2 rounded-lg self-start bg-blue-50/90">
        <View className="flex flex-row gap-2">
          {openCapsule && <Text className="font-normal text-gray-800">{text}</Text>}
          <Ionicons name="chatbox-ellipses" size={16} color={"#3B82F6"}/>
        </View>
        <View className="flex flex-row items-center justify-start gap-2 mt-1">
        <Avatar uri={profile?.avatar_url || ''} size={20} plan={profile?.plan} />
          <Text className="text-xs text-gray-500">{timestamp}</Text>
          <DoubleTickIcon size={20} color="green" />
        </View>
      </TouchableOpacity>
    );
  };

  // Scroll to bottom after new messages
  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [userMessages]);

  return (
    <View className="w-full max-h-28 pr-2">
      {userMessages.length > 0 && (
        <FlatList
          ref={flatListRef}
          data={userMessages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 4 }}
          inverted
        />
      )}
    </View>
  );
}
