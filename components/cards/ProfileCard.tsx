import Subs from "@/app/modals/subs";
import { ThemedText } from "@/components/template/ThemedText";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { Profile } from "@/types/types";
import { deleteSub, insertSub } from "@/utils/supabase/crudSub";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { Avatar } from "../avatars/Avatar";
import AssistantButton from "../buttons/AssistantButton";
import SubscribeButton from "../buttons/SubButton";
import NumberFormatter from "../helpers/NumberFormatter";

type ProfileCardProps = {
  profile: Profile;
  hideDetails?: boolean;
  onToggleSub: (profileId: string, isSub: boolean) => void;
  onCallAssistantWithAI: (profile: Profile, convo_session_id: string) => void;
};

export const ProfileCard = ({ profile, hideDetails, onToggleSub, onCallAssistantWithAI }: ProfileCardProps) => {
  const { isAuthenticated, user } = useAuth();
  const [showSubsModal, setShowSubsModal] = useState(false);

  const toggleSubscribe = async () => {
    if (!user) return;

    try {
      if (profile.isSub) {
        const res = await deleteSub(profile.id, user.id);
        if (res) onToggleSub(profile.id, false);
      } else {
        const res = await insertSub(profile.id, user.id);
        if (res) onToggleSub(profile.id, true);
      }
    } catch (err) {
      Alert.alert("You toggled subs just recently.");
    }
  };

  const handleCallAssistant = async () => {
    if (isAuthenticated && user?.id !== profile.id) {
      const convo_session_id = await handleRoomSession();
      onCallAssistantWithAI(profile, convo_session_id);
    } else if (user?.id === profile.id) {
      Alert.alert("Can't call yourself.");
    } else if (!isAuthenticated) {
      Alert.alert("Sign in to continue");
    }
  }

  const handleRoomSession = async () => {
  if (!isAuthenticated) {
    Alert.alert("Sign in to continue");
    return;
  }

  // 1️⃣ Check if a convo already exists
  const { data: existingConvos, error: fetchError } = await supabase
    .from("convo")
    .select("*")
    .or(
      `and(caller_id.eq.${user?.id},user_id.eq.${profile.id}))`
    )
    .limit(1);

  if (fetchError) throw fetchError;

  let convo;
  if (existingConvos && existingConvos.length > 0) {
    // ✅ Reuse the existing convo
    convo = existingConvos[0];
  } else {
    // 2️⃣ Create a new room only if none exists
    const { data: newConvo, error: insertError } = await supabase
      .from("convo")
      .insert({
        caller_id: user?.id, // the current user initiating
        user_id: profile.id, // the callee being called
      })
      .select()
      .single();

    if (insertError) throw insertError;

    convo = newConvo;
  }

  // 3️⃣ Create a new convo for this convo
  const { data: convo_session, error: convoSessionError } = await supabase
    .from("convo_session")
    .insert({
      convo_id: convo.id,
      duration: 0,
      transcript: null,
    })
    .select()
    .single();

  if (convoSessionError) throw convoSessionError;

  return convo_session.id;
};


  return (
    <>
      <Subs
        visible={showSubsModal}
        profile={profile}
        onClose={() => setShowSubsModal(false)}
      />

      <View className="rounded-xl bg-white dark:bg-zinc-800 w-full px-3 py-4 pb-0">
        <View className="flex flex-row items-center gap-2 w-full">
          <Link className="flex-1" href={`/profile/${profile.id}`}>
            <Avatar uri={profile.avatar_url} size={48} showTick={true} />
            <View className="pl-2">
              <ThemedText className="font-semibold text-lg">
                {profile.full_name}
              </ThemedText>
              <ThemedText className="text-sm">@{profile.handle}</ThemedText>
            </View>
          </Link>

          {!hideDetails && <SubscribeButton
            subscribed={profile.isSub}
            size="sm"
            onPress={toggleSubscribe}
          />}

        </View>


        <View className="intro px-2 py-3">
          {profile.intro && (
            <ThemedText className="text-sm">{profile.intro}</ThemedText>)}
        </View>

        {!hideDetails && <>
          <AssistantButton
            label={`Talk to my assistant`}
            onPress={handleCallAssistant}
          />

          <View className="bg-white dark:bg-zinc-800 flex flex-row justify-center gap-0 ">
            <TouchableOpacity className="pt-4 pb-3 px-2" onPress={() => setShowSubsModal(true)}>
              <ThemedText className="text-sm">
                <ThemedText className="font-semibold">
                  <NumberFormatter value={profile.subCount || 0} />
                </ThemedText>{" "}
                subscriber{profile.subCount === 1 ? "" : "s"}
              </ThemedText>
            </TouchableOpacity>

            <Link className="pt-4 pb-3 px-2" href={`/profile/${profile.id}`}>
              <ThemedText className="text-sm">
                <ThemedText className="font-semibold">
                  <NumberFormatter value={profile.capsuleCount || 0} />
                </ThemedText>{" "}
                message{(profile.capsuleCount || 0) === 1 ? "" : "s"}
              </ThemedText>
            </Link>
          </View>
        </>}

      </View>
    </>
  );
};

