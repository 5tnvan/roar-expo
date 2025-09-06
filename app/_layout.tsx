import { Avatar } from '@/components/avatars/Avatar';
import Push from '@/components/notif/Push';
import { PipecatProvider } from '@/components/providers/PipeCatProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import AuthProvider, { useAuth } from '@/services/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import debug from "debug";
import * as Notifications from 'expo-notifications';
import { router, Tabs, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';
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

export function HeaderRight() {
    const colorScheme = useColorScheme();

    const iconColor = colorScheme === "dark" ? "white" : "black";

    return (
        <View style={{ flexDirection: "row", gap: 8, marginRight: 10 }}>
            <Pressable onPress={() => router.push("/search")}>
                <Ionicons name="search-outline" size={24} color={iconColor} />
            </Pressable>
        </View>
    );
}

export function HeaderLeft() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={{ marginLeft: 10, marginRight: 5 }}
      onPress={() => {
        router.push("/"); // go home
      }}
    >
      <View className="flex-row items-center gap-1">
        <Ionicons
          name="chevron-back-sharp"
          size={24}
          color="#3B82F6" 
        />
        <Text className='text-blue-500 text-xl'>
          Home
        </Text>
      </View>
    </TouchableOpacity>
  );
}



function InnerLayout() {
    const colorScheme = useColorScheme();
    const { profile } = useAuth();

    const isAndroid = Platform.OS === "android";

    const pathname = usePathname(); // gets the current route

    const showBottomMenu = pathname !== "call"; // hide menu on tabs page

    debug.disable();

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <View className="flex-1 font-sans">
                <Tabs
                    screenOptions={{ tabBarActiveTintColor: "#3B82F6" }}
                    backBehavior="order">
                    <Tabs.Screen
                        name="(home)"
                        options={{
                            title: "Calling",
                            headerShown: false,
                            tabBarLabel: "CALLING",
                            tabBarStyle: { display: "none" },
                            href: null,
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons
                                    name="call-outline"
                                    size={size}
                                    color={color}
                                />
                            ),
                        }}
                    />
                    <Tabs.Screen name="created_by_me"
                        options={{
                            title: "Created By Me ",
                            headerShown: true,
                            tabBarLabel: "CREATED BY ME",
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons
                                    name="create-outline"
                                    size={size}
                                    color={color}
                                />
                            ),
                            headerRight: () => <HeaderRight />,
                            headerLeft: () => <HeaderLeft />,
                        }} />
                    <Tabs.Screen name="subs"
                        options={{
                            title: "Subs",
                            headerShown: true,
                            tabBarLabel: "SUBS",
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons
                                    name="people-outline"
                                    size={size}
                                    color={color}
                                />
                            ),
                            headerRight: () => <HeaderRight />,
                            headerLeft: () => <HeaderLeft />,
                        }} />
                        <Tabs.Screen name="explore"
                        options={{
                            title: "Explore",
                            headerShown: true,
                            tabBarLabel: "EXPLORE",
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons
                                    name="compass-outline"
                                    size={size}
                                    color={color}
                                />
                            ),
                            headerRight: () => <HeaderRight />,
                            headerLeft: () => <HeaderLeft />,
                        }} />
                        <Tabs.Screen name="approved"
                        options={{
                            title: "Approved",
                            headerShown: true,
                            tabBarLabel: "APPROVED",
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons
                                    name="hand-right-outline"
                                    size={size}
                                    color={color}
                                />
                            ),
                            headerRight: () => <HeaderRight />,
                            headerLeft: () => <HeaderLeft />,
                        }} />
                        <Tabs.Screen name="my_profile"
                        options={{
                            title: `@${profile?.handle}`,
                            headerShown: true,
                            tabBarLabel: `@${profile?.handle.toUpperCase()}`,
                            tabBarIcon: ({ color, size }) => (
                                <Avatar uri={profile?.avatar_url || ''} size={30} plan={profile?.plan} />
                            ),
                            headerRight: () => <HeaderRight />,
                            headerLeft: () => <HeaderLeft />,
                        }} />
                        </Tabs>
                        
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

