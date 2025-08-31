import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, useColorScheme, View } from 'react-native';
import { ThemedText } from '../ThemedText';

export default function AuthGoogle() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '729757470966-vbk4aetpi73h4h8ak8rd88eoqvfae9g6.apps.googleusercontent.com',
      iosClientId: '729757470966-rk0opa2oc7aijps95nmfvrl1lbnb6be7.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.type === 'success') {
        const idToken = userInfo.data.idToken;
        if (!idToken) throw new Error('No ID token present');

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
      } else {
        console.log('Sign-in cancelled:', userInfo);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, friction: 3 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3 }).start();
  };

  return (
    <View className="flex items-center justify-center rounded-3xl mb-6">
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={handleGoogleSignIn}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={`flex-row items-center justify-center gap-2 px-6 py-3 rounded-3xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
        >
          <Ionicons name="logo-google" size={20} color={isDark ? "white" : "dark"} />
          <ThemedText className="font-medium text-white text-lg">Sign in with Google</ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}
