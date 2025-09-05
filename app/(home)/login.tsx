import AuthGoogle from '@/components/auth/AuthGoogle';
import { ThemedText } from '@/components/template/ThemedText';
import { ThemedView } from '@/components/template/ThemedView';
import { useAuth } from '@/services/providers/AuthProvider';
import React from 'react';
import { Image, Modal, TouchableOpacity, useColorScheme, View } from "react-native";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function Login({ visible, onClose }: LoginModalProps) {
  const { isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (isAuthenticated) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView className={`flex-1 ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`}>
        {/* Header */}
        <ThemedView className="flex-row justify-between items-center p-4 border-b border-gray-500/20">
          <ThemedText className="text-lg font-bold">{`Login`}</ThemedText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <ThemedText className="text-blue-400">Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <View className="bg-zinc-200 dark:bg-zinc-900 flex-1 justify-center items-center p-6">
          {/* Logo */}
          <Image
            source={require('../../assets/images/icon-ios.png')}
            className="w-24 h-24 mb-6 rounded-lg"
            resizeMode="contain"
          />

          {/* Intro Text */}
          <ThemedText className="text-center text-gray-700 dark:text-gray-200 mb-8 text-lg">
            Hey, {`I'm`} Roar! {`Let's`} start?
          </ThemedText>

          {/* Google Sign-In */}
          <AuthGoogle />
        </View>
      </ThemedView>
    </Modal>
  );
}
