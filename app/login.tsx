import AuthGoogle from '@/components/auth/AuthGoogle';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/services/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from "react-native";

export default function Login() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log("Error signing out:", error.message);
      } else {
        router.back();
        console.log("✅ Signed out successfully");
      }
    } catch (err) {
      console.error("Unexpected error during signout:", err);
    }
  };

  return (
    <View className="flex flex-col items-center justify-center gap-4">
      {isAuthenticated ? (
        <>
          <ThemedText className="text-white">
            Welcome, {user?.user_metadata.full_name}
          </ThemedText>
          <Pressable
            onPress={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <Text>Log out</Text>
          </Pressable>
        </>
      ) : (
        <AuthGoogle />
      )}
    </View>
  );
}
