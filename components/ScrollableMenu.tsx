import { useAuth } from "@/services/providers/AuthProvider";
import { Link, type Href } from "expo-router";
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";

// explicit tab→route mapping with literal route types
const tabRoutes: Record<string, Href> = {
    "CREATED BY ME": "/my_profile",
    "MY FEED": "/feed",
    "EXPLORE": "/explore",
    "SEARCH": "/search",
    "I APPROVED": "/collectible",
};

const allTabs = [
    "CALL",
    "CREATED BY ME",
    "MY FEED",
    "EXPLORE",
    "SEARCH",
    "I APPROVED",
] as const;

const publicTabs = ["CALL", "EXPLORE", "SEARCH"] as const;

export default function ScrollableMenu() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { isAuthenticated } = useAuth();
    const tabScreens = isAuthenticated ? allTabs : publicTabs;

    return (
        <View className="mb-5 h-12 justify-center mx-3">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: "center" }}
            >
                {tabScreens.map((tab) => {
                    const route = tabRoutes[tab];

                    if (route) {
                        return (
                            <Link key={tab} href={route} className="mx-3">
                                <Text className={`text-lg ${isDark ? "text-white" : "text-white"}`}>
                                    {tab}
                                </Text>
                            </Link>
                        );
                    }

                    // fallback (e.g. CALL)
                    return (
                        <TouchableOpacity key={tab} className="mx-3">
                            <Text
                                className={`text-lg ${tab === "CALL" ? "text-white font-bold" : "text-white"
                                    }`}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
