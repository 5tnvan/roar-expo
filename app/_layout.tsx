import { Avatar } from '@/components/avatars/Avatar';
import Push from '@/components/notif/Push';
import { PipecatProvider } from '@/components/providers/PipeCatProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import AuthProvider, { useAuth } from '@/services/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Button, Platform, Pressable, View } from 'react-native';
import 'react-native-reanimated';
import "../css/global.css";

export default function RootLayout() {
  useNotificationObserver();

  return (
    <AuthProvider>
      <PipecatProvider>
        <InnerLayout />
        <Push />
      </PipecatProvider>
    </AuthProvider>
  );
}

export function HeaderActions() {
  const colorScheme = useColorScheme();
  const { profile } = useAuth();

  const iconColor = colorScheme === "dark" ? "white" : "black";

  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <Pressable onPress={() => router.push("/search")}>
        <Ionicons name="search-outline" size={24} color={iconColor} />
      </Pressable>

      <Pressable onPress={() => router.push("/notifications")}>
        <Ionicons name="notifications-outline" size={24} color={iconColor} />
      </Pressable>

      <Pressable onPress={() => router.push("/account")}>
        <Avatar size={24} uri={profile?.avatar_url || ""} />
      </Pressable>
    </View>
  );
}

function InnerLayout() {
  const colorScheme = useColorScheme();
  const { profile } = useAuth();

  const isAndroid = Platform.OS === "android";

  const pathname = usePathname(); // gets the current route

  const showBottomMenu = pathname !== "call"; // hide menu on tabs page

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View className="flex-1 font-sans">
        <Stack>
          <Stack.Screen name="(tabs)"
            options={{
              presentation: 'card',
              headerShown: false,
              animation: isAndroid ? "none" : "default",
            }} />
            <Stack.Screen name="call"
              options={{
              headerShown: true,
              title: "Roar",
              headerBackTitle: "Back",
              animation: isAndroid ? "none" : "default",
            }} />
          <Stack.Screen name="create_capsule"
            options={{
              presentation: 'card',
              headerShown: true,
              title: "+ New message",
              headerBackTitle: "Back",
              animation: isAndroid ? "none" : "default",
            }} />
          <Stack.Screen name="subs"
            options={{
              presentation: 'card',
              headerShown: true,           // show header
              title: "Subs",               // title in the header
              headerBackTitle: "Back",      // text on back button
              animation: isAndroid ? "none" : "default",
              headerRight: () => (<HeaderActions />),
            }} />
          <Stack.Screen name="explore"
            options={{
              presentation: 'card',
              headerShown: true,           // show header
              title: "Explore",               // title in the header
              headerBackTitle: "Back",      // text on back button
              animation: isAndroid ? "none" : "default",
              headerRight: () => (<HeaderActions />),
            }} />
          <Stack.Screen name="created_by_me"
            options={{
              presentation: 'card',
              headerShown: true,           // show header
              title: "Created by me",               // title in the header
              headerBackTitle: "Back",      // text on back button
              animation: isAndroid ? "none" : "default",
              headerRight: () => (<HeaderActions />),
            }} />
          <Stack.Screen name="search"
            options={{
              presentation: 'card',
              headerShown: true,           // show header
              title: "Search",               // title in the header
              headerBackTitle: "Back",      // text on back button
              animation: isAndroid ? "none" : "default",
            }} />
          <Stack.Screen name="approved"
            options={{
              presentation: 'card',
              headerShown: true,           // show header
              title: "I approved",               // title in the header
              headerBackTitle: "Back",      // text on back button
              animation: isAndroid ? "none" : "default",
              headerRight: () => (<HeaderActions />),
            }} />
          <Stack.Screen name="account"
            options={{
              presentation: 'card',
              headerShown: true,           // show header
              title: "Account",
              headerBackTitle: "Back",      // text on back button
              animation: isAndroid ? "none" : "default",
            }} />
          <Stack.Screen name="bot"
            options={{
              presentation: 'card',
              headerShown: true,           // show header
              title: "Conversational Agent",
              headerBackTitle: "Back",      // text on back button
              animation: isAndroid ? "none" : "default",
            }} />
            <Stack.Screen name="convos"
            options={{
              presentation: 'card',
              headerShown: true,           // show header
              title: "Roar Talks",
              headerBackTitle: "Back",      // text on back button
              animation: isAndroid ? "none" : "default",
            }} />
          <Stack.Screen
            name="profile/[profile]"
            options={{
              presentation: 'card',
              headerShown: true,
              title: "Author",
              headerBackTitle: "Back",
              animation: isAndroid ? "none" : "default",
              headerRight: () => (<HeaderActions />),
            }}
          />
          <Stack.Screen
            name="convo/[convo]"
            options={{
              presentation: 'card',
              headerShown: false,
              // title: "Convo",
              // headerBackTitle: "Back",
              animation: isAndroid ? "none" : "default",
            }}
          />
          <Stack.Screen
            name="capsule/[capsule]"
            options={({ navigation }: { navigation: any }) => ({
              presentation: "card",
              headerShown: true,
              title: "Message",
              headerBackTitle: "Back",
              animation: isAndroid ? "none" : "default",
              headerRight: () => (
                <Button
                  title="Close"
                  onPress={() => {
                    navigation.replace("call"); // Go home
                  }}
                />
              ),
            })}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}

function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url as any);
      }
      console.log("Notification received:", notification.request.content.data);

    }

    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}

