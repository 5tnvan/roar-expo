import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type PromptInputProps = {
  showPromptInput: boolean;
  textPromptInput: string;
  setTextPromptInput: (text: string) => void;
  handleDetectTextPrompt: () => void;
  loading1: boolean;
};

export default function PromptInput({
  showPromptInput,
  textPromptInput,
  setTextPromptInput,
  handleDetectTextPrompt,
  loading1,
}: PromptInputProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate in/out when showPromptInput changes
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showPromptInput ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showPromptInput]);

  if (!showPromptInput) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="px-7 z-10"
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <View className="flex-row items-center">
          <TextInput
            value={textPromptInput}
            onChangeText={setTextPromptInput}
            placeholder="I'm looking for..."
            className="flex-1 p-4 bg-zinc-100 text-black rounded-md"
            placeholderTextColor="#9ca3af"
          />
          <Pressable
            onPress={() => handleDetectTextPrompt()}
            className="ml-2 p-4 bg-blue-600 rounded-md items-center justify-center"
          >
            {loading1 ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Enter</Text>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
