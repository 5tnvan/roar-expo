import { useAuth } from "@/services/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

type Tab = "CALLING" | "CREATED BY ME" | "SUBS" | "EXPLORE" | "I APPROVED";

const tabRoutes: Record<Tab, string> = {
  CALLING: "/", // root of your tabs
  "CREATED BY ME": "/created_by_me",
  SUBS: "/subs",
  EXPLORE: "/explore",
  "I APPROVED": "/approved",
};

const tabIcons: Record<Tab, { active: string; inactive: string }> = {
  CALLING: { active: "call-sharp", inactive: "call-outline" },
  "CREATED BY ME": { active: "create-sharp", inactive: "create-outline" },
  SUBS: { active: "people-sharp", inactive: "people-outline" },
  EXPLORE: { active: "compass-sharp", inactive: "compass-outline" },
  "I APPROVED": { active: "hand-right-sharp", inactive: "hand-right-outline" },
};

export default function BottomMenu() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  return (
    <View
      className={`flex-row justify-around items-center py-2 ${
        isDark ? "bg-zinc-900" : "bg-white"
      } border-t border-gray-300`}
    >
      {Object.entries(tabRoutes).map(([tabKey, route]) => {
        const tab = tabKey as Tab;
        const isActive =
          pathname === route || (route !== "/" && pathname.startsWith(route));

        return (
          <Link key={tab} href={route} asChild>
            <TouchableOpacity className="flex-col items-center">
              <Ionicons
                name={
                  isActive ? tabIcons[tab].active : tabIcons[tab].inactive
                }
                size={24}
                color={isDark ? "white" : "black"}
              />
              <Text
                className={`text-xs mt-1 ${
                  isDark ? "text-white" : "text-black"
                } ${isActive ? "font-bold" : ""}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          </Link>
        );
      })}
    </View>
  );
}
