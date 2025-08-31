import { ThemedText } from '@/components/ThemedText';
import { LanguageChooser } from '@/components/ui/LangChooser';
import { languages } from '@/constants/Languages';
import { useAuth } from '@/services/providers/AuthProvider';
import { LanguageOption } from '@/types/types';
import { updateProfileBotLanguage } from '@/utils/supabase/crudProfile';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated, user, profile, refetchProfile } = useAuth();
  const [language, setLanguage] = useState<LanguageOption | undefined>();

  useEffect(() => {
    if (profile?.bot_language) {
      const selected = languages.find(lang => lang.gemini_code === profile.bot_language);
      if (selected) setLanguage(selected);
    }
  }, [profile]);

  const handleLanguageChange = async (lang: LanguageOption) => {
    if (!isAuthenticated) {Alert.alert("Login")}
    setLanguage(lang);
    if (!user) return;
    const success = await updateProfileBotLanguage(user.id, lang.gemini_code);
    if (success) await refetchProfile();
  };

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className='p-4'>
      
        <>{/* Account Settings */}
          <ThemedText className='font-bold'>Settings</ThemedText>
          <View className='mt-4'>
            <View className='flex flex-row gap-2 mb-2 items-center'>
              <Ionicons name="chatbubbles-outline" size={15} color={isDark ? "white" : "black"} />
              <ThemedText>Name</ThemedText>
            </View>
            <ThemedText className='opacity-50'>Roar</ThemedText>
          </View>
          <View className='lang w-full gap-3 mt-4'>
            <View className='flex flex-col w-full'>
              <View className='flex flex-row gap-2 mb-2 items-center'>
                <Ionicons name="chatbubbles-outline" size={15} color={isDark ? "white" : "black"} />
                <ThemedText>Language & Persona</ThemedText>
              </View>
              <Text className={isDark ? "text-white/60" : "text-black"}>
                Your agent is multilingual, can switch languages mid-chat—choose a local persona for authentic accents, expressions, and cultural nuance.
              </Text>
            </View>
            <LanguageChooser selectedLanguage={language} onSelect={handleLanguageChange} />
          </View>
        </>
      
    </SafeAreaView>
  );
}
