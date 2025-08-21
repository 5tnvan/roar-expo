import { supabase } from '@/lib/supabase';
import { AntDesign } from '@expo/vector-icons';
import {
  GoogleSignin
} from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { Pressable, Text, useColorScheme, View } from 'react-native';

export default function AuthGoogle() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  GoogleSignin.configure({
    webClientId: '729757470966-vbk4aetpi73h4h8ak8rd88eoqvfae9g6.apps.googleusercontent.com',
    iosClientId: '729757470966-rk0opa2oc7aijps95nmfvrl1lbnb6be7.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  })

  return (
    <View className='flex items-center justify-center rounded-3xl mb-1 bg-white border'>
      <Pressable
        className='flex-row items-center justify-center gap-1 mt-2 mb-3 ml-2 mr-3'
        onPress={async () => {
          console.log("pressed");
          try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log("Sign-in response:", JSON.stringify(userInfo, null, 2));

            if (userInfo.type === "success") {
              const idToken = userInfo.data.idToken;
              if (idToken) {
                console.log("Got idToken:", idToken);
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: 'google',
                  token: idToken,
                });
                console.log("Supabase response:", { error, data });
                // Close modal (go back to layout)
                router.back();
              } else {
                throw new Error("No ID token present in success response");
              }
            } else {
              console.log("Sign-in was cancelled:", userInfo);
            }
          } catch (error: any) {
            console.error("Sign-in error:", error);
          }
        }}
      ><AntDesign name="google" size={14} color={`${colorScheme === 'dark' ? 'black' : 'black'}`} /><Text className="font-medium color-black" style={{ fontSize: 19 }}>Sign in with Google</Text></Pressable>
    </View>
  )
}