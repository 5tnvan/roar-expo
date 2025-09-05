// CapsuleCard.tsx
import { Capsule } from "@/types/types";
import { getReadMinutes } from "@/utils/getReadMinutes";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { Image, Text, View, useColorScheme } from "react-native";
import { Avatar } from "../avatars/Avatar";
import AssistantButton from "../buttons/AssistantButton";
import { ThemedText } from "../template/ThemedText";

interface CapsuleCardProps {
  capsule: Capsule;
  onReadWithAI?: (capsule: Capsule) => void;
  onToggleSub?: (capsule: Capsule) => void;
}

export default function CapsuleCard2({ capsule, onReadWithAI, onToggleSub }: CapsuleCardProps) {
  const deepLink = `roarapp://capsule/${capsule.id}`;
  const fallbackLogo = require("../../assets/logo/roar-qr-3.png");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const readMinutes = getReadMinutes(capsule.content + capsule.pdf_content);

  // Get first sentence
  const match = capsule.title.match(/.*?[.?!]/);
  let firstSentence = match ? match[0].trim() : capsule.title.trim();

  return (
    <View className={`rounded-xl overflow-hidden relative ${isDark ? "bg-zinc-900" : "bg-white"} shadow-md`}>
      
      {/* Capsule Cover */}
      
      {capsule.image_url && (
        <View>
          <Image
            source={{ uri: capsule.image_url }}
            className="w-full h-96"
            resizeMode="cover"
          />
        </View>
      )}
      
      

      <View className="px-4 pt-2 pb-4">
        {/* Avatar + Handle + Read time */}
        <View className="flex-row items-center justify-between mb-3">
          <Link href={`/capsule/${capsule.id}`} className="">
          <View className="flex-row items-center gap-2">
            
            <Avatar uri={capsule.owner.avatar_url} size={40} showTick />
            <Text className={`font-normal text-lg ${isDark ? "text-white" : "text-black"}`}>
              @{capsule.owner.handle}
            </Text>
            
          </View>
          </Link>
          <View className="flex-row items-center gap-1 ml-2">
          <Ionicons name="call-sharp" size={15} color="green" />
          <ThemedText className="opacity-80">{readMinutes} min</ThemedText>
        </View>


        </View>
        {/* Capsule Title */}
        <Link href={`/capsule/${capsule.id}`} className="w-full mb-2">
        <Text className={`text-xl ${isDark ? "text-white" : "text-gray-800"}`}>
          {firstSentence}
        </Text></Link>

        
        <AssistantButton label="Roar" onPress={() => onReadWithAI && onReadWithAI(capsule)} />

      </View>

      
      
    </View>
  );
}
