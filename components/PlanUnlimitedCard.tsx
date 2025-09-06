// PlanUnlimitedCard.tsx
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import ProgressBar from "./ProgressBar";
import { ExternalLink } from "./template/ExternalLink";

interface PlanCardProps {
  title: string;
  dataUsage: { progress: number; used: string; };
  tokenUsage: { progress: number; used: string; };
}

export default function PlanUnlimitedCard({
  title,
  dataUsage,
  tokenUsage,
}: PlanCardProps) {
  return (
    <View className="rounded-2xl overflow-hidden">
      <LinearGradient
      colors={["#ef4444", "#f97316", "#f59e0b"]} // red-500 → orange-500 → amber-500
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="w-full"
    >
      <View className="p-5 rounded-2xl">
        {/* Plan Title */}
      <Text className="text-3xl font-light tracking-wider text-white">
        {title}
      </Text>

      {/* Data Usage */}
      <View className="mt-3 gap-2">
        <Text className="text-white font-medium">Data usage</Text>
        <Text className="text-sm text-white">
          This includes your media files, posts and conversations.
        </Text>
        <ProgressBar progress={dataUsage.progress} fillColor="#fdba74" />
        <Text className="text-xs text-white text-right">
          {dataUsage.used}
        </Text>
      </View>

      {/* Token Usage */}
      <View className="mt-4 gap-2">
        <Text className="text-white font-medium">Token usage</Text>
        <Text className="text-sm text-white">
          This is billed by <ExternalLink className="underline" href={"https://www.heyroar.com"}>Roar</ExternalLink> Gemini API Service.
        </Text>
        <ProgressBar progress={tokenUsage.progress} fillColor="#fdba74" />
        <Text className="text-xs text-white text-right">
          {tokenUsage.used}
        </Text>
      </View>
      </View>
      
    </LinearGradient>
    </View>
    
  );
}
