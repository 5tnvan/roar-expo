import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import ModalInspectionMods from "../inspection_mods";
import ModalUsersManuals from "../users_manuals";
import TabCamera from "./camera";

const tabScreens = ["CAMERA", "HOW-TO", "DOWNLOADS", "DOCS", "CURRICULUM", "SETTINGS"];

export default function Layout() {
  
  const [activeTab, setActiveTab] = useState("CAMERA");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderTabContent = () => {
    switch (activeTab) {
      case "CAMERA":
        return <TabCamera />;
      case "HOW-TO":
        return <ModalUsersManuals />;
      case "DOWNLOADS":
        return <ModalInspectionMods />;
      default:
        return (
          <View className="flex-1 justify-center items-center">
            <Text className={`${isDark ? "text-white" : "text-black"} text-xl`}>{activeTab} Screen</Text>
          </View>
        );
    }
  };

  return (
    <View className={`flex-1 relative ${isDark ? "" : ""}`}>
      {/* Screen Content */}
      <View className="flex-1 bg-slate-400 p-30">{renderTabContent()}</View>
      {/* <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="camera" />
    </Tabs> */}
<View className="absolute bottom-0">
  <BlurView className="bg-gray-500/80 ">
      <Link href="/users_manuals">
        Open modal
      </Link>
        {/* Scrollable Tabs (above bottom action bar) */}
      <View className="mb-8 mt-4 h-14 justify-center ">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, alignItems: "center" }}
        >
          {tabScreens.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="mx-5"
            >
              <Text
                className={`text-lg ${isDark ? "text-white" : "text-black"} ${activeTab === tab ? "text-white font-bold" : "text-gray-400 font-normal"}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Action Bar */}
      <View className="flex-row justify-around items-center">
        <Pressable
          className="px-7 py-3 rounded-full bg-gray-600"
          onPress={() => console.log("Search pressed")}
        >
          <Ionicons name="search" size={20} color="white" />
        </Pressable>

        <Pressable
          className="px-6 py-4 rounded-full bg-gray-600"
          onPress={() => console.log("Camera pressed")}
        >
          <Ionicons name="camera" size={24} color="white" />
        </Pressable>

        <Pressable
          className="px-7 py-3 rounded-full bg-gray-600"
          onPress={() => console.log("Mic pressed")}
        >
          <Ionicons name="mic" size={20} color="white" />
        </Pressable>
      </View>
      </BlurView>
</View>
      

      
    </View>
  );
}
