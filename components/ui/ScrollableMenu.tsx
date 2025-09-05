import { useAuth } from "@/services/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, type Href } from "expo-router";
import { Pressable, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";

type Tab = "CALL" | "CREATED BY ME" | "SUBS" | "EXPLORE" | "APPROVED";

const tabRoutes: Partial<Record<Tab, Href>> = {
  "CREATED BY ME": "/created_by_me",
  "SUBS": "/subs",
  "EXPLORE": "/explore",
  "APPROVED": "/approved",
};

const tabIcons: Record<Tab, string> = {
  CALL: "call-outline",
  "CREATED BY ME": "create-outline",
  SUBS: "people-outline",
  EXPLORE: "compass-outline",
  "APPROVED": "hand-right-outline",
};

const allTabs: Tab[] = ["CALL", "CREATED BY ME", "SUBS", "EXPLORE", "APPROVED"];
const publicTabs: Tab[] = [];

interface ScrollableMenuProps {
  onTabAction?: (tab: Tab) => void;
}

interface ScrollableMenuProps {
  onTabAction?: (tab: Tab) => void;
  showPosts?: boolean; // <- new prop to indicate active state
}

export default function ScrollableMenu({ onTabAction, showPosts }: ScrollableMenuProps) {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuth();
  const tabScreens = isAuthenticated ? allTabs : publicTabs;

  return (
    <View className="flex flex-row items-center mb-2 justify-center mx-4">
      {/* Search button */}
      {isAuthenticated && (
        <Pressable className="pr-2" onPress={() => router.push("/search")}>
          <Ionicons name="search-circle" size={34} color="white" />
        </Pressable>
      )}

      {/* Flame button for parent toggle */}
      {isAuthenticated && (
        <Pressable className="pr-2" onPress={() => onTabAction?.("EXPLORE")}>
          <Ionicons
            name="flame-outline"
            size={26}
            color={showPosts ? "#f59e0b" : "white"} // amber when active, white otherwise
          />
        </Pressable>
      )}

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
                  tab === "CALL" ? "font-bold" : ""
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
                className="px-2 py-2 rounded-lg"
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
