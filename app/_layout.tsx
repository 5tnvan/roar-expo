import { PipecatProvider } from '@/components/pipecat/PipeCat';
import Push from '@/components/Push';
import { useColorScheme } from '@/hooks/useColorScheme';
import AuthProvider, { useAuth } from '@/services/providers/AuthProvider';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';
import "../css/global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <InnerLayout />
      <Push />
    </AuthProvider>
  );
}

function InnerLayout() {
  const colorScheme = useColorScheme();
  const { user, profile } = useAuth();
  console.log(profile);
  
const isAndroid = Platform.OS === "android";

  return (
    <AuthProvider>
      <PipecatProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View className="flex-1 font-sans">
            <Stack>
              <Stack.Screen name="(tabs)" 
              options={{
                headerShown: false,
                headerBackTitle: "Back",
                animation: isAndroid ? "none" : "default",
              }} />
              <Stack.Screen name="create_capsule"
                options={{
                  presentation: 'card',
                  headerShown: true,           // show header
                  title: "+ New message",               // title in the header
                  headerBackTitle: "Back",      // text on back button
                  animation: isAndroid ? "none" : "default",
                }} />
              <Stack.Screen name="feed"
                options={{
                  presentation: 'card',
                  headerShown: true,           // show header
                  title: "Feed",               // title in the header
                  headerBackTitle: "Back",      // text on back button
                  animation: isAndroid ? "none" : "default",
                }} />
              <Stack.Screen name="explore"
                options={{
                  presentation: 'card',
                  headerShown: true,           // show header
                  title: "Explore",               // title in the header
                  headerBackTitle: "Back",      // text on back button
                  animation: isAndroid ? "none" : "default"
                }} />
              <Stack.Screen name="my_profile"
                options={{
                  presentation: 'card',
                  headerShown: true,           // show header
                  title: "Created by me",               // title in the header
                  headerBackTitle: "Back",      // text on back button
                  animation: isAndroid ? "none" : "default",
                }} />
              <Stack.Screen name="search"
                options={{
                  presentation: 'card',
                  headerShown: true,           // show header
                  title: "Search",               // title in the header
                  headerBackTitle: "Back",      // text on back button
                  animation: isAndroid ? "none" : "default",
                }} />
                <Stack.Screen name="collectible"
                options={{
                  presentation: 'card',
                  headerShown: true,           // show header
                  title: "I approve this message",               // title in the header
                  headerBackTitle: "Back",      // text on back button
                  animation: isAndroid ? "none" : "default",
                }} />
              <Stack.Screen name="login"
                options={{
                  presentation: 'card',
                  headerShown: true,           // show header
                  title: user?.email || "Login",
                  headerBackTitle: "Back",      // text on back button
                  animation: isAndroid ? "none" : "default",
                }} />
              <Stack.Screen
                name="profile/[profile]"
                options={{
                  presentation: 'card',
                  headerShown: true,
                  title: "Author",
                  animation: isAndroid ? "none" : "default",     
                }}
              />
              <Stack.Screen
                name="capsule/[capsule]"
                options={{
                  presentation: 'card',
                  headerShown: true,
                  title: "Message",
                  animation: isAndroid ? "none" : "default"
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </View>
        </ThemeProvider>
      </PipecatProvider>
    </AuthProvider>
  );
}
