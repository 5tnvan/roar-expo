import Subs from "@/app/subs";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/services/providers/AuthProvider";
import { Profile } from "@/types/types";
import { deleteSub, insertSub } from "@/utils/supabase/crudSub";
import { Link } from "expo-router";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Avatar } from "./Avatar";
import AssistantButton from "./ui/AssistantButton";
import NumberFormatter from "./ui/NumberFormatter";
import SubscribeButton from "./ui/SubButton";

type ProfileCardProps = {
  profile: Profile;
  hideDetails?: boolean;
  onToggleSub: (profileId: string, isSub: boolean) => void;
};

export const ProfileCard = ({ profile, hideDetails, onToggleSub }: ProfileCardProps) => {
  const { user } = useAuth();
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
      console.error("Error toggling subscription:", err);
    }
  };

  return (
    <>
      <Subs
        visible={showSubsModal}
        profile={profile}
        onClose={() => setShowSubsModal(false)}
      />

      <View className="rounded-xl bg-white dark:bg-gray-800 w-full p-4 pb-0 ">
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

        {profile.intro && (
          <View className="intro px-2 py-3">
            <ThemedText className="text-sm">{profile.intro}</ThemedText>
          </View>
        )}
        {!hideDetails && <>
          <AssistantButton onPress={() => { }} />

          <View className="bg-white dark:bg-gray-800 flex flex-row justify-center gap-0 ">
            <TouchableOpacity className="p-4" onPress={() => setShowSubsModal(true)}>
              <ThemedText className="text-sm">
                <ThemedText className="font-semibold">
                  <NumberFormatter value={profile.subCount || 0} />
                </ThemedText>{" "}
                subscriber{profile.subCount === 1 ? "" : "s"}
              </ThemedText>
            </TouchableOpacity>

            <Link className="p-4" href={`/profile/${profile.id}`}>
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

