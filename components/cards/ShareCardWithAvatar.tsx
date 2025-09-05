// ShareCardWithAvatar.tsx
import { Capsule } from "@/types/types";
import { getReadMinutes } from "@/utils/getReadMinutes";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View, useColorScheme } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Avatar } from "../avatars/Avatar";
import AssistantButton from "../buttons/AssistantButton";
import { ThemedText } from "../template/ThemedText";

interface ShareCardWithAvatarProps {
  capsule: Capsule;
}

export default function ShareCardWithAvatar({ capsule }: ShareCardWithAvatarProps) {
  const deepLink = `roarapp://capsule/${capsule.id}`;
  const fallbackLogo = require("../../assets/logo/roar-qr-3.png");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const readMinutes = getReadMinutes(capsule.content + capsule.pdf_content);

  // First sentence logic
  const match = capsule.title.match(/.*?[.?!]/);
  let firstSentence = match ? match[0].trim() : capsule.title.trim();

  return (
    <View className={`rounded-xl overflow-hidden relative ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      {/* Capsule Cover */}
      {capsule.image_url && (
        <View>
          <Image
            source={{ uri: capsule.image_url }}
            className="w-full h-96"
            resizeMode="cover"
          />
          {/* QR Code */}
          <View className="absolute top-2 right-2 p-1 bg-white rounded-lg">
            <QRCode
              value={deepLink}
              size={50}
              logoSize={20}
              logo={fallbackLogo}
              backgroundColor="#ffffff"
            />
          </View>
        </View>
      )}

      <View className="p-4">
        {/* Avatar + Handle */}
        <View className="flex-row items-center justify-between gap-3 mb-3">
          <View className="flex flex-row items-center gap-2">
            <Avatar uri={capsule.owner.avatar_url || capsule.image_url} size={40} showTick />
            <Text className={`font-semibold text-lg ${isDark ? "text-white" : "text-black"}`}>
              {capsule.owner.handle}
            </Text>
            <View className="flex flex-row justify-center items-center gap-1">
              <Ionicons name="call-sharp" size={15} color="green" />
              <ThemedText className="opacity-80">{readMinutes} min</ThemedText>
            </View>
          </View>
          <AssistantButton label="ROAR" onPress={() => { }} />
        </View>

        {/* Capsule Title */}
        <Text className={`text-2xl my-1 ${isDark ? "text-white" : "text-gray-800"}`}>
          {firstSentence}
        </Text>




      </View>
    </View>
  );
}
