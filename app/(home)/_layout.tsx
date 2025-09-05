import { useNotifications } from "@/hooks/useNotifications";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Platform, Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function Layout() {
  const isAndroid = Platform.OS === "android";
  const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
  const { unreadCount } = useNotifications();
  return (
    <Stack>
      <Stack.Screen name="index"
        options={{
          title: "Home",
          presentation: 'card',
          headerShown: false,
          animation: isAndroid ? "none" : "default",
        }} />
      <Stack.Screen
  name="account"
  options={{
    title: "Account",
    presentation: "card",
    headerShown: true,
    animation: isAndroid ? "none" : "default",
    headerRight: () => {

      return (
        <TouchableOpacity
          className="mr-0"
          onPress={() => router.push("/my_notifications")}
        >
          <View className="relative">
            <Ionicons name="notifications-outline" size={24} color={isDark ? "white" : "black"} />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full px-1 min-w-[16px] items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
  }}
/>

      <Stack.Screen
        name="bot"
        options={{
          title: "Conversational Agent",
          presentation: 'card',
          headerShown: true,
          animation: isAndroid ? "none" : "default",
        }}
      />
      <Stack.Screen
        name="create_capsule"
        options={{
          title: "+ New Message",
          presentation: 'card',
          headerShown: true,
          animation: isAndroid ? "none" : "default",
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          title: "Search",
          presentation: 'card',
          headerShown: true,
          animation: isAndroid ? "none" : "default",
        }}
      />
      <Stack.Screen
        name="my_notifications"
        options={{
          title: "",
          presentation: 'card',
          headerShown: true,
          animation: isAndroid ? "none" : "default",
        }}
      />
      <Stack.Screen
        name="convos"
        options={{
          title: "Conversations",
          presentation: 'card',
          headerShown: true,
          animation: isAndroid ? "none" : "default",
        }}
      />
      <Stack.Screen
        name="capsule/[capsule]"
        options={{
          title: "Message",
          presentation: 'card',
          headerShown: true,
          animation: isAndroid ? "none" : "default",
        }}
      />
      <Stack.Screen
        name="profile/[profile]"
        options={{
          title: "Author",
          presentation: 'card',
          headerShown: true,
          animation: isAndroid ? "none" : "default",
        }}
      />
      <Stack.Screen
        name="convo/[convo]"
        options={{
          title: "Call Thread",
          presentation: 'card',
          headerShown: true,
          animation: isAndroid ? "none" : "default",
        }}
      />
      <Stack.Screen name="home-nested" options={{ title: "Home Nested" }} />
      <Stack.Screen name="+not-found" />
    </Stack>

  );
}