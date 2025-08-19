import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const tabScreens = ["Camera", "How-to", "Downloads", "Docs", "Curriculum", "Settings"];

export default function Layout() {
  const [activeTab, setActiveTab] = useState("Camera");

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      {/* Screen Content */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text className="text-blue-500 font-mono">{activeTab} Screen</Text>
      </View>

      {/* Scrollable Tabs (like Camera Roll) */}
      <View style={{ height: 60, justifyContent: "center" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            alignItems: "center",
          }}
        >
          {tabScreens.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{ marginHorizontal: 12 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: activeTab === tab ? "700" : "400",
                  color: activeTab === tab ? "white" : "gray",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Action Bar */}
      <View
      className="bg-slate-600"
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: 12,
          borderTopWidth: 0.5,
          borderTopColor: "gray",
          backgroundColor: "#111",
        }}
      >
        <TouchableOpacity>
          <Ionicons name="search" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="camera" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="mic" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
