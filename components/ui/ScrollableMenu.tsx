import { useAuth } from "@/services/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";

type Tab = "CALLING" | "CREATED BY ME" | "SUBS" | "EXPLORE" | "SEARCH" | "I APPROVED";

const tabRoutes: Partial<Record<Tab, Href>> = {
  "CREATED BY ME": "/created_by_me",
  "SUBS": "/subs",
  "EXPLORE": "/explore",
  "SEARCH": "/search",
  "I APPROVED": "/approved",
};

const tabIcons: Record<Tab, string> = {
  CALLING: "call-outline",
  "CREATED BY ME": "create-outline",
  SUBS: "people-outline",
  EXPLORE: "compass-outline",
  SEARCH: "search-outline",
  "I APPROVED": "hand-right-outline",
};

const allTabs: Tab[] = ["CALLING", "CREATED BY ME", "SUBS", "EXPLORE", "SEARCH", "I APPROVED"];
const publicTabs: Tab[] = ["CALLING", "EXPLORE", "SEARCH"];

interface ScrollableMenuProps {
  onTabAction?: (tab: Tab) => void;
}

export default function ScrollableMenu({ onTabAction }: ScrollableMenuProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated } = useAuth();
  const tabScreens = isAuthenticated ? allTabs : publicTabs;

  return (
    <View className="mb-2 justify-center mx-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {tabScreens.map((tab) => {
          const route = tabRoutes[tab];
          const iconName = tabIcons[tab];

          const content = (
            <View className="flex-row items-center">
              <Ionicons name={iconName as any} size={18} color="white" />
              <Text
                className={`text-lg ml-2 text-white/80 ${
                  tab === "CALLING" ? "font-bold" : ""
                }`}
              >
                {tab}
              </Text>
            </View>
          );

          if (route) {
            return (
              <Link key={tab} href={route} asChild>
                <TouchableOpacity activeOpacity={0.6} className="px-4 py-2 rounded-lg">
                  {content}
                </TouchableOpacity>
              </Link>
            );
          } else {
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => onTabAction?.(tab)}
                activeOpacity={0.6}
                className="px-4 py-2 rounded-lg"
              >
                {content}
              </TouchableOpacity>
            );
          }
        })}
      </ScrollView>
    </View>
  );
}
