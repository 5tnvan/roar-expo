import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import TabCamera from "./camera";
import TabInspectionMods from "./inspection_mods";
import TabUsersManuals from "./users_manuals";

// Import your tab components


const tabScreens = [
  { name: "CAMERA", component: <TabCamera /> },
  { name: "HOW-TO", component: <TabUsersManuals /> },
  { name: "DOWNLOADS", component: <TabInspectionMods /> },
];

export default function Layout() {
  const [activeTab, setActiveTab] = useState("CAMERA");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Find the component of the active tab
  const activeComponent = tabScreens.find((tab) => tab.name === activeTab)?.component;

  return (
    <View className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Screen Content */}
      <View className="flex-1">{activeComponent}</View>

      {/* Scrollable Tabs (like Camera Roll) */}
      <View className="h-14 justify-center">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, alignItems: "center" }}
        >
          {tabScreens.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              onPress={() => setActiveTab(tab.name)}
              className="mx-3 px-3 py-1 rounded-full"
              style={{
                backgroundColor: activeTab === tab.name ? "#4f46e5" : isDark ? "#374151" : "#e5e7eb",
              }}
            >
              <Text
                className={`text-lg ${activeTab === tab.name ? "text-white font-bold" : isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Action Bar */}
      <SafeAreaView className="flex-row justify-around items-center py-3">
        <Pressable
          className="px-5 py-2 rounded-full bg-slate-400"
          onPress={() => console.log("Search pressed")}
        >
          <Ionicons name="search" size={20} color="white" />
        </Pressable>

        <Pressable
          className="px-5 py-2 rounded-full bg-slate-400"
          onPress={() => console.log("Camera pressed")}
        >
          <Ionicons name="camera" size={20} color="white" />
        </Pressable>

        <Pressable
          className="px-5 py-2 rounded-full bg-slate-400"
          onPress={() => console.log("Mic pressed")}
        >
          <Ionicons name="mic" size={20} color="white" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
