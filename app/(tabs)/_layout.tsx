import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Pressable, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Link } from "expo-router";
import TabCamera from "./camera";

const tabScreens = ["CAMERA", "HOW-TO", "DOWNLOADS", "DOCS", "CURRICULUM", "SETTINGS"];

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 relative">
      {/* Camera tab */}
      <SafeAreaView className="flex-1 bg-slate-400">
        <TabCamera />
      </SafeAreaView>

      {/* Bottom tab bar */}
      <BlurView
        className="absolute bottom-0 w-full"
        intensity={80}
        tint={isDark ? "dark" : "light"}
      >
        <SafeAreaView className="-mt-6">
          {/* Scrollable Tabs */}
          <View className="mb-10 h-12 justify-center">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8, alignItems: "center" }}
            >
              {tabScreens.map((tab) => {
                if (tab === "HOW-TO") {
                  return (
                    <Link key={tab} href="/users_manuals" style={{ marginHorizontal: 12 }}>
                      <Text style={{ color: isDark ? "white" : "gray", fontSize: 16 }}>
                        {tab}
                      </Text>
                    </Link>
                  );
                }
                if (tab === "DOWNLOADS") {
                  return (
                    <Link key={tab} href="/inspection_mods" style={{ marginHorizontal: 12 }}>
                      <Text style={{ color: isDark ? "white" : "gray", fontSize: 16 }}>
                        {tab}
                      </Text>
                    </Link>
                  );
                }
                // CAMERA or future tabs
                return (
                  <TouchableOpacity key={tab} style={{ marginHorizontal: 12 }}>
                    <Text
                      style={{
                        color: tab === "CAMERA" ? "white" : isDark ? "white" : "gray",
                        fontSize: 16,
                        fontWeight: tab === "CAMERA" ? "bold" : "normal",
                      }}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Bottom action buttons */}
          <View className="flex-row justify-around items-center mb-3">
            <Pressable className="px-7 py-3 rounded-full bg-gray-600">
              <Ionicons name="search" size={20} color="white" />
            </Pressable>

            <Pressable className="px-6 py-4 rounded-full bg-gray-600">
              <Ionicons name="camera" size={24} color="white" />
            </Pressable>

            <Pressable className="px-7 py-3 rounded-full bg-gray-600">
              <Ionicons name="mic" size={20} color="white" />
            </Pressable>
          </View>
        </SafeAreaView>
      </BlurView>
    </View>
  );
}
