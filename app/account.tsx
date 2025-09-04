import AppButton from '@/components/buttons/AppButton';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { ThemedText } from '@/components/template/ThemedText';
import { LanguageChooser } from '@/components/ui/LangChooser';
import { languages } from '@/constants/Languages';
import { useProfileByUserId } from '@/hooks/useProfileByUserId';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/services/providers/AuthProvider';
import { LanguageOption } from '@/types/types';
import { uploadToBunny } from '@/utils/bunny/uploadToBunny';
import { updateProfileAppLanguage, updateProfileAvatar } from '@/utils/supabase/crudProfile';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TextInput, useColorScheme, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Account() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { isAuthenticated, user, profile, refetchProfile } = useAuth();
  const { profile: profileById, handleToggleSub } = useProfileByUserId(user?.id as string);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [handle, setHandle] = useState(profile?.handle || '');
  const [intro, setIntro] = useState(profile?.intro || '');
  const [language, setLanguage] = useState<LanguageOption | undefined>();
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalField, setModalField] = useState<'fullName' | 'handle' | 'intro' | 'avatar' | null>(null);

  useEffect(() => {
    if (profile?.app_language) {
      const selected = languages.find(lang => lang.gemini_code === profile.app_language);
      if (selected) setLanguage(selected);
    }
    if (profile) {
      setFullName(profile.full_name);
      setHandle(profile.handle);
      setAvatarUrl(profile.avatar_url);
      setIntro(profile.intro);
    }
  }, [profile]);

  const handleLanguageChange = async (lang: LanguageOption) => {
    setLanguage(lang);
    if (!user) return;
    const success = await updateProfileAppLanguage(user?.id || '', lang.gemini_code);
    if (success) await refetchProfile();
  };

  const handleLogout = async () => {
    if (!user) {
    Alert.alert("No user logged in, skipping sign out");
    return;
  }
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
    else router.back();
  };

  const openModal = (field: 'fullName' | 'handle' | 'intro' | 'avatar') => {
    setModalField(field);
    setModalVisible(true);
  };

  const saveModalField = async () => {
    if (!user) return;

    const limits = {
      fullName: 50,
      handle: 20,
      intro: 200,
    };

    const sanitize = (value: string, limit: number) =>
      value.replace(/[\r\n]+/g, " "); // remove newlines

    let value = "";

    switch (modalField) {
      case 'fullName':
        value = sanitize(fullName, limits.fullName);
        if (value.length > limits.fullName) {
          alert(`Full name cannot exceed ${limits.fullName} characters.`);
          return;
        }
        await supabase.from('profile').update({ full_name: value }).eq('id', user.id);
        setFullName(value);
        break;

      case "handle":
        value = sanitize(handle, limits.handle);

        // enforce no spaces, only letters/numbers/underscore, lowercase
        value = value.replace(/\s+/g, ""); // remove spaces
        value = value.toLowerCase();

        if (!/^[a-z0-9_]+$/.test(value)) {
          alert("Handle can only contain lowercase letters, numbers, and underscores.");
          setHandle(profile?.handle || ""); // revert back
          return;
        }

        if (value.length > limits.handle) {
          alert(`Handle cannot exceed ${limits.handle} characters.`);
          setHandle(profile?.handle || ""); // revert back
          return;
        }

        // ✅ check if handle already exists (excluding current user)
        const { data: existing, error: existingError } = await supabase
          .from("profile")
          .select("id")
          .eq("handle", value)
          .neq("id", user.id) // exclude the current user
          .maybeSingle();

        if (existingError) {
          console.error("Error checking handle:", existingError);
          alert("Something went wrong. Please try again.");
          setHandle(profile?.handle || ""); // revert back
          return;
        }

        if (existing) {
          alert("That handle is already taken. Please choose another.");
          setHandle(profile?.handle || ""); // revert back
          return;
        }

        // ✅ safe to update
        await supabase.from("profile").update({ handle: value }).eq("id", user.id);
        setHandle(value);
        break;

      case 'intro':
        value = sanitize(intro, limits.intro);
        if (value.length > limits.intro) {
          alert(`Intro cannot exceed ${limits.intro} characters.`);
          return;
        }
        await supabase.from('profile').update({ intro: value }).eq('id', user.id);
        setIntro(value);
        break;

      case 'avatar':
        // already handled via ImagePicker
        break;
    }

    setModalVisible(false);
    await refetchProfile();
  };


  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const avatarFile: any = {
        uri: uri,
        type: "image",
        name: `${Date.now()}.jpeg`,
      };
      const res = await uploadToBunny(avatarFile, "profile_avatar", avatarFile.name, user?.id);
      console.log("Avatar uploaded:", res);
      const success = await updateProfileAvatar(user?.id || '', res);
      if (success) await refetchProfile();
    }
  };

  return (
    <><SafeAreaView edges={['right', 'bottom', 'left']}>

      {isAuthenticated && (
        <><ScrollView className='' contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'flex-start', // items-start
          gap: 12,                  // gap-4 (16px)
          padding: 12,              // p-4
        }}>
          {profile && user?.id && <ProfileCard profile={profileById || profile} onToggleSub={handleToggleSub} onCallAssistantWithAI={() => Alert.alert("Can't call yourself.")} />}

          <ThemedText className='font-bold'>Profile</ThemedText>
          <View className="flex flex-col w-full gap-4">
            {/* Full Name */}
            <View className="flex flex-row justify-between items-center">
              <View>
                <ThemedText className="text-md">Full Name</ThemedText>
                <ThemedText className="opacity-50">{fullName || "Not set"}</ThemedText>
              </View>
              <AppButton title="Change" variant="outline" onPress={() => openModal('fullName')} />
            </View>

            {/* Handle */}
            <View className="flex flex-row justify-between items-center">
              <View>
                <ThemedText className="text-md">Handle</ThemedText>
                <ThemedText className="opacity-50">{`@${handle}` || "Not set"}</ThemedText>
              </View>
              <AppButton title="Change" variant="outline" onPress={() => openModal('handle')} />
            </View>

            {/* Intro */}
            <View className="flex flex-row justify-between items-center">
              <View className="flex-1">
                <ThemedText className="text-md">Intro</ThemedText>
                <ThemedText className="opacity-50">{intro || "Not set"}</ThemedText>
              </View>
              <AppButton title="Change" variant="outline" onPress={() => openModal('intro')} />
            </View>

            {/* Avatar */}
            <View className="avatar">
              <ThemedText className="text-md font-semibold">Avatar</ThemedText>
              <View className='flex flex-row justify-between items-center'>
                {avatarUrl && <Image source={{ uri: avatarUrl }} className="w-24 h-24 rounded-md" />}
                <AppButton title="Change" variant="outline" onPress={pickAvatar} />
              </View>
            </View>
          </View>

          {/* Account Settings */}
          <ThemedText className='font-bold mt-4'>Account Settings</ThemedText>
          <View>
            <ThemedText>Email</ThemedText>
            <ThemedText className='opacity-50'>{user?.email}</ThemedText>
          </View>
          <View className='lang w-full gap-3'>
            <View className='flex flex-col w-full'>
              <View className='flex flex-row gap-2 mb-2 items-center'>
                <Ionicons name="language-outline" size={15} color={isDark ? "white" : "black"} />
                <ThemedText>App Language</ThemedText>
              </View>
              <Text className={isDark ? "text-white/60" : "text-black"}>
                Your app will be localized to this language.
              </Text>
            </View>
            <LanguageChooser selectedLanguage={language} onSelect={handleLanguageChange} />
          </View>

          <AppButton
            title="Log out"
            variant="dark"
            onPress={handleLogout}
            className='w-full'
          />

          {/* Edit Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50 p-4">
              <View className="bg-white dark:bg-zinc-800 rounded-lg w-full p-4 gap-2">
                {modalField === 'avatar' ? (
                  <AppButton title="Pick Image" variant="primary" onPress={pickAvatar} />
                ) : (
                  <>
                    <TextInput
                      value={modalField === 'fullName' ? fullName : modalField === 'handle' ? handle : intro}
                      onChangeText={text => {
                        if (modalField === 'fullName') setFullName(text);
                        if (modalField === 'handle') setHandle(text);
                        if (modalField === 'intro') setIntro(text);
                      }}
                      placeholder={modalField || undefined}
                      style={{ fontSize: 18, padding: 10 }} // bigger text
                      className="border border-gray-400 rounded-md p-2 text-black dark:text-white"
                    />
                    <AppButton title="Save" variant="primary" onPress={saveModalField} />
                  </>
                )}
                <AppButton title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </Modal>
        </ScrollView>
        </>
      )}
    </SafeAreaView>
    </>
  );
}
