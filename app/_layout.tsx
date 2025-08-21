import { useColorScheme } from '@/hooks/useColorScheme';
import AuthProvider from '@/services/providers/AuthProvider';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import "../css/global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View className="flex-1 font-sans">
          <Stack>
            <Stack.Screen name="(tabs)" options={{
              headerShown: false,           // show header
            }} />
            <Stack.Screen name="inspection_mods"
              options={{
                presentation: 'card',
                headerShown: true,           // show header
                title: "Downloads",               // title in the header
                headerBackTitle: "Back"      // text on back button
              }} />
            <Stack.Screen name="users_manuals"
              options={{
                presentation: 'card',
                headerShown: true,           // show header
                title: "How-to",               // title in the header
                headerBackTitle: "Back"      // text on back button
              }} />
              <Stack.Screen name="login"
              options={{
                presentation: 'card',
                headerShown: true,           // show header
                title: "Login",               // title in the header
                headerBackTitle: "Back"      // text on back button
              }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </AuthProvider>
  );
}
