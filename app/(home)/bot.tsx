import AppButton from '@/components/buttons/AppButton';
import { ExternalLink } from '@/components/template/ExternalLink';
import { ThemedText } from '@/components/template/ThemedText';
import { LanguageChooser } from '@/components/ui/LangChooser';
import { languages } from '@/constants/Languages';
import { useAuth } from '@/services/providers/AuthProvider';
import { LanguageOption } from '@/types/types';
import { updateProfileBotLanguage, updateProfileGeminiKey } from '@/utils/supabase/crudProfile';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Clipboard, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Bot() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated, user, profile, refetchProfile } = useAuth();
  const [language, setLanguage] = useState<LanguageOption | undefined>();
  const [geminiKey, setGeminiKey] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false); // toggle show/hide

  useEffect(() => {
    if (profile?.bot_language) {
      const selected = languages.find(lang => lang.gemini_code === profile.bot_language);
      if (selected) setLanguage(selected);
    }
    if (profile?.gemini_api_key) {
      setGeminiKey(profile.gemini_api_key);
    }
  }, [profile]);

  const handleLanguageChange = async (lang: LanguageOption) => {
    if (!isAuthenticated) {
      Alert.alert("Sign in to continue");
      return;
    }
    if (!user) return;

    const success = await updateProfileBotLanguage(user.id, lang.gemini_code);
    if (success) {
      Alert.alert("Language & Persona saved!");
      setLanguage(lang);
      await refetchProfile();
    } else {
      Alert.alert("Failed to save Language & Persona.");
    }
    if (success) await refetchProfile();
  };

  const handleCopyApiKey = () => {
    if (geminiKey) {
      Clipboard.setString(geminiKey);
      Alert.alert('Gemini API Key copied to clipboard!');
    }
  };

  const handleSaveApiKey = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert("Sign in to save your API key.");
      return;
    }
    const success = await updateProfileGeminiKey(user.id, geminiKey);
    if (success) {
      Alert.alert("Gemini API Key saved!");
      await refetchProfile();
    } else {
      Alert.alert("Failed to save API Key.");
    }
  };

  return (
    <SafeAreaView edges={['right', 'bottom', 'left']} className='p-4'>
      <ThemedText className='font-bold'>Settings</ThemedText>

      {/* Name */}
      <View className='mt-4'>
        <View className='flex flex-row gap-2 mb-2 items-center'>
          <Ionicons name="chatbubbles-outline" size={15} color={isDark ? "white" : "black"} />
          <ThemedText>Name</ThemedText>
        </View>
        <ThemedText className='opacity-50'>Roar</ThemedText>
      </View>

      {/* Language & Persona */}
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

      {/* Gemini API Key */}
      <View className='mt-6'>
        <View className='flex flex-row gap-2 mb-2 items-center'>
          <Ionicons name="key-outline" size={15} color={isDark ? "white" : "black"} />
          <ThemedText>Gemini API Key *</ThemedText>
        </View>
        <Text className={isDark ? "text-white/60" : "text-black"}>
          Get started for free, with your own Gemini API key from <ExternalLink className='text-blue-500' href={'https://aistudio.google.com/'}>Google AI Studio</ExternalLink>.
        </Text>         
        <View className='flex flex-row items-center gap-2 mt-2'>
          <TextInput
            value={geminiKey}
            onChangeText={setGeminiKey}
            secureTextEntry={!showKey}
            placeholder="Enter Gemini API Key"
            className={`${geminiKey.length === 0 ? "border border-red-500" : "border border-blue-500"} flex-1 p-3 rounded bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white`}
          />
          <TouchableOpacity onPress={() => setShowKey(!showKey)} className='p-2 bg-zinc-200 dark:bg-zinc-700 rounded'>
            <Ionicons name={showKey ? "eye-off-outline" : "eye-outline"} size={22} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCopyApiKey} className='p-2 bg-zinc-200 dark:bg-zinc-700 rounded'>
            <Ionicons name="copy-outline" size={22} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSaveApiKey} className='px-3 py-2 bg-zinc-200 dark:bg-zinc-700 rounded'>
            <ThemedText className='text-white text-center'>Save</ThemedText>
          </TouchableOpacity>
        </View>
        <Text className={`mt-2 opacity-50 ${isDark} ? "text-white" : "text-black"`}>
          * Key is required to call Roar Bot.
        </Text>
      </View>
      <AppButton
                title="Upgrade Now"
                variant="primary"
                onPress={() => {router.push("/plans")}}
                className='w-full'
            />
    </SafeAreaView>
  );
}
