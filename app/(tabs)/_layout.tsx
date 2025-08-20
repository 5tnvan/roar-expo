import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Link } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TabCamera from "./camera";

const tabScreens = [
  "CAMERA",
  "HOW-TO",
  "DOWNLOADS",
  "PLACEHOLDER1",
  "PLACEHOLDER2",
  "PLACEHOLDER3",
];

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <>
      <BlurView className="absolute top-0 w-full z-10 px-4" intensity={100} tint={isDark ? "dark" : "light"}>
        <SafeAreaView className="mt-5">
          <Link className="" href="/login">
            <Text className="text-white text-lg font-bold ml-2">Login</Text>
          </Link>
        </SafeAreaView>
      </BlurView>
      <View className="flex-1 relative">
        {/* Camera tab */}
        <SafeAreaView className="flex-1 bg-slate-400">
          <TabCamera />
        </SafeAreaView>


      </View>
      {/* Bottom tab bar */}
      <BlurView
        className="absolute bottom-0 w-full"
        intensity={100}
        tint={isDark ? "dark" : "light"}
      >
        <SafeAreaView className="-mt-6">
          {/* Scrollable Tabs */}
          <View className="mb-10 h-12 justify-center mx-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {tabScreens.map((tab) => {
                if (tab === "HOW-TO") {
                  return (
                    <Link
                      key={tab}
                      href="/users_manuals"
                      className="mx-3"
                    >
                      <Text className={`text-lg ${isDark ? "text-white" : "text-white"}`}>
                        {tab}
                      </Text>
                    </Link>
                  );
                }
                if (tab === "DOWNLOADS") {
                  return (
                    <Link
                      key={tab}
                      href="/inspection_mods"
                      className="mx-3"
                    >
                      <Text className={`text-lg ${isDark ? "text-white" : "text-white"}`}>
                        {tab}
                      </Text>
                    </Link>
                  );
                }
                // CAMERA or other placeholders
                return (
                  <TouchableOpacity key={tab} className="mx-3">
                    <Text
                      className={`text-lg ${tab === "CAMERA"
                          ? "text-white font-bold"
                          : isDark
                            ? "text-white"
                            : "text-white"
                        }`}
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
    </>

  );
}
