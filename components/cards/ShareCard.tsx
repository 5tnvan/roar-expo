// ShareCard.tsx
import { Capsule } from "@/types/types";
import { getReadMinutes } from "@/utils/getReadMinutes";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View, useColorScheme } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Avatar } from "../avatars/Avatar";
import AssistantButton from "../buttons/AssistantButton";
import { ThemedText } from "../template/ThemedText";

interface ShareCardProps {
  capsule: Capsule;
}

const MAX_LEN = 300; // ⬅️ set your max here

export default function ShareCard({
  capsule
}: ShareCardProps) {
  const deepLink = `roarapp://capsule/${capsule.id}`;
  const fallbackLogo = require("../../assets/logo/roar-qr-3.png");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const readMinutes = getReadMinutes(capsule.content + capsule.pdf_content);
  // Match first sentence ending with . ? or !
const match = capsule.title.match(/.*?[.?!]/);

let firstSentence = match ? match[0].trim() : capsule.title.trim();

// Enforce max length
if (firstSentence.length > MAX_LEN) {
  firstSentence = firstSentence.slice(0, MAX_LEN).trim() + "…";
}

  return (
    <View className={`rounded-xl w-full p-4 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      {/* Avatar + Handle */}
      <View className="flex-row items-center justify-between gap-3 mb-3">
        <View className="flex flex-row items-center gap-2">
          <Avatar uri={capsule.owner.avatar_url} size={40} showTick />
          <Text className={`font-semibold text-lg ${isDark ? "text-white" : "text-black"}`}>
            {capsule.owner.handle}
          </Text>
        </View>
        <AssistantButton label="Call Roar" onPress={() => {}} />
      </View>

      {/* Capsule Title */}
      <Text
  className={`text-2xl ${isDark ? "text-white" : "text-gray-800"}`}
>
  {firstSentence}
</Text>

      {/* QR Code */}
      <View className="items-center my-5">
        <QRCode
          value={deepLink}
          size={150}
          logo={fallbackLogo}
          logoSize={40}
          logoMargin={1}
          logoBorderRadius={8}
          backgroundColor={isDark ? "#ffffff" : "#ffffff"}
        />
      </View>

      {/* Read Minutes */}
      <View className="flex flex-row gap-1 mx-auto">
              <View className="flex flex-row justify-center items-center gap-1">
                <Ionicons name="call-sharp" size={15} color="green" />
                <ThemedText className="opacity-80">{readMinutes} min call</ThemedText>
              </View>
              <ThemedText>by</ThemedText>
              <Text className={`text-lg font-normal opacity-50 ${isDark ? "text-white" : "text-black"}`}>{capsule.owner.full_name}
                </Text>
      
            </View>
    </View>
  );
}
