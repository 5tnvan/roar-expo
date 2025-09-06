import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import ProgressBar from "./ProgressBar";
import { ExternalLink } from "./template/ExternalLink";

interface PlanCardProps {
  title: string;
  dataUsage: { progress: number; used: string };
  tokenUsage: { progress: number; used: string };
}

export default function PlanStartCard({
  title,
  dataUsage,
  tokenUsage,
}: PlanCardProps) {
  return (
    <View className="rounded-lg overflow-hidden">
      <LinearGradient
        colors={["#3B82F6", "#06B6D4", "#0D9488"]} // blue-500 → cyan-500 → teal-500
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className=""
      >
        <View className="p-5">
          {/* Plan Title */}
          <Text className="text-3xl font-light tracking-wider text-white mb-4">{title}</Text>

          {/* Data Usage */}
          <View className="flex-col gap-2">
            <Text className="text-white/90 font-medium">Data usage</Text>
            <Text className="text-sm text-white/70">
              This includes your media files, posts and conversations.
            </Text>
            <ProgressBar progress={dataUsage.progress} fillColor="#1d4ed8" />
            <Text className="text-xs text-white/80 text-right">{dataUsage.used}</Text>
          </View>

          {/* Token Usage */}
          <View className="flex-col gap-2">
            <Text className="text-white/90 font-medium">Token usage</Text>
            <Text className="text-sm text-white/70">
              This is billed by your Gemini API service.
            </Text>
            <ProgressBar progress={tokenUsage.progress} fillColor="#1d4ed8" />
            <Text className="text-xs text-white/80 text-right">
              <ExternalLink className="text-white" href="https://aistudio.google.com/">
                Go to Google AI Studio
              </ExternalLink>
            </Text>
          </View>
        </View>

      </LinearGradient>
    </View>

  );
}
