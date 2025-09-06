import { Avatar } from "@/components/avatars/Avatar";
import BackgroundNoAnim from "@/components/bg/BackgroundNoAnim";
import AppButton from "@/components/buttons/AppButton";
import AssistantButton from "@/components/buttons/AssistantButton";
import { usePipecat } from "@/components/providers/PipeCatProvider";
import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import TranscriptionLog3 from "@/components/transcript/TranscriptionLog3";
import { useConvoSessionByConvoId } from "@/hooks/useConvoById";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { formatSecIntoMins } from "@/utils/formatters/formatSecIntoMins";
import { getReadMinutesFromContent } from "@/utils/formatters/getReadMinutesFromContent";
import { timeAgo } from "@/utils/formatters/timeAgo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Convo() {
  const { user } = useAuth();
  const { convo: convo_id } = useLocalSearchParams();
  const { convos, isLoading, fetchMore, refetch } = useConvoSessionByConvoId(convo_id as string);
  const [reply, setReply] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { sendCapsule, sendConvoSession } = usePipecat();

  const router = useRouter();

  const flatListRef = useRef<FlatList>(null);

  if (isLoading && convos.length === 0)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  if (!convo_id) return <ThemedText>Convo not found.</ThemedText>;

  if (convos.length === 0)
    return (
      <ThemedView className="flex-1 justify-center items-center p-4">
        <ThemedText className="text-center">No conversation sessions yet.</ThemedText>
      </ThemedView>
    );

  const handleGoBack = () => {
    router.push("/");
  };

  const handleCallAssistant = (callee_profile: any, convo_session_id: string, convo_session_reply_id: string,) => {
    sendConvoSession(callee_profile, convo_session_id, convo_session_reply_id);
    router.replace("/");
  }

  const handleSendReply = async () => {
    if (!reply.trim()) return;

    const lastSession = convos[0]; // latest session (since list is inverted)
    if (!lastSession) return;

    // Insert into convo_session_reply
    const { error } = await supabase
      .from("convo_session_reply")
      .insert({
        convo_session_id: lastSession.id,
        content: reply.trim(),
      });

    if (error) {
      console.error("Error inserting reply:", error);
      return;
    }

    console.log("Reply saved to supabase:", reply);

    // reset input + typing state
    setReply("");
    setIsTyping(false);

    // scroll up to highlight the session
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    refetch();
  };

  const callee = convos[0].callee;
  const caller = convos[0].caller;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-white dark:bg-black">
      <BackgroundNoAnim>

        {/* FlatList messages */}
        <FlatList
          ref={flatListRef}
          data={convos}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          inverted
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => {
            const isLast = item.id === convos[0].id;
            const shouldHighlight = isLast && isTyping;

            return (
              <View
                className={`px-2 mb-1 ${shouldHighlight ? "mx-2 border-l-4 border-blue-500" : ""
                  }`}
              >
                <View className="border-t border-gray-800 dark:border-gray-500/50 w-1/2 items-center mx-auto mt-2"></View>
                <View className="flex flex-row justify-center my-2 gap-2">
                  <Text className="text-sm text-gray-800 dark:text-gray-400">
                    @{caller.handle} •
                  </Text>
                  <View className="flex flex-row justify-center items-center gap-1">
                    <Ionicons name="call-outline" color={isDark ? "grey" : "black"} size={10} />
                    <Text className="gap-2 text-sm text-black dark:text-gray-400">
                      {formatSecIntoMins(item.duration || 0)} • {timeAgo(item.created_at)} ago
                    </Text></View>

                </View>
                <TranscriptionLog3 caller={item.caller} callee={item.callee} log={item.transcript || []} />

                {item.reply && item.reply.length > 0 && (
                  <View className="w-full self-center">
                    {item.reply.map((rep: any, idx: number) => (
                      <View
                        key={idx}
                        className="my-1.5 items-start p-2 border-r-4 border-l-4 border-blue-500 rounded-lg bg-blue-200/80 dark:bg-blue-500/50"
                      >
                        {/* Header: Avatar + Reply info */}
                        <View className="flex flex-row items-center gap-2 mb-1">
                          <Avatar uri={item.callee?.avatar_url} size={40} plan={item.callee?.plan} showTick />
                          <View className="flex flex-col items-start">
                            <Text className="text-md black dark:white font-semibold text-gray-800 dark:text-gray-200">
                              {user?.id === callee.id ? "Yay, you replied!" : "Yay, you've got a message!"}

                            </Text>
                            <View className="flex flex-row items-center gap-1">
                              <Text className="text-sm text-gray-500 dark:text-gray-400">
                    @{item.callee?.handle} •
                  </Text>
                              <Ionicons name="call-outline" size={12} color="grey" />
                              <Text className="text-sm text-gray-500 dark:text-gray-400">
                                {getReadMinutesFromContent(rep.content)} mins • {timeAgo(rep.created_at)} ago
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Reply content */}
                        {user?.id === callee.id ? <Text className="text-gray-700 dark:text-gray-300 my-3">{rep.content}</Text> : ""}
                        {user?.id === callee.id ? <Text className="text-gray-700 dark:text-gray-300 my-3">{rep.id}</Text> : ""}


                        {/* Button */}
                        <View className="self-end">
                          <View className="flex flex-row">
                            {user?.id === callee.id ? "" : <AppButton
                              title="Call to open"
                              size="sm"
                              variant="primary"
                              icon="call-outline"
                              iconSize={13}
                              onPress={() => handleCallAssistant(callee, item.id, rep.id)}
                            />}
                          </View>
                        </View>

                      </View>
                    ))}

                  </View>
                )}

              </View>
            );
          }}
          ListFooterComponent={() =>
            isLoading ? (
              <View className="py-4">
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />
        {/* Talk again button */}
        {user?.id === caller.id && (
          <ThemedView className="pt-2 px-2 w-full">
            <AssistantButton
              label={`@${callee.handle}`}
              size={50}
              onPress={() => handleCallAssistant(callee, convos[0].id, '')}
            />
          </ThemedView>

        )}
      </BackgroundNoAnim>

      {/* Reply */}
      {user?.id === callee.id && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>


            <View className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 p-2 flex-col">
              {isTyping &&
                <View className="mb-3 mt-1">
                  <Text className="text-black dark:text-white">Replying to @{convos[0].caller.handle}.</Text>
                  <Text className="text-black/50 dark:text-white/50">This reply is private. Caller has to call in to read it.</Text>
                </View>
              }


              <View className="flex-row items-center gap-2">

                <>
                  <Avatar uri={callee.avatar_url} size={30} showTick plan={callee.plan} />
                  <TextInput
                    value={reply}
                    onChangeText={(text) => {
                      setReply(text);
                      setIsTyping(text.length > 0); // 🔥 highlight when typing
                    }}
                    placeholder="Type a reply..."
                    placeholderTextColor={isDark ? "#aaa" : "#555"}
                    className="flex-1 p-4 border border-zinc-200 dark:border-zinc-800 rounded-md text-black dark:text-white bg-zinc-100 dark:bg-zinc-900"
                  />
                  <TouchableOpacity onPress={handleSendReply}>
                    <Ionicons name="send" size={24} color={isDark ? "white" : "black"} />
                  </TouchableOpacity>
                </>

              </View>

            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
