// ShareProfileCardWithAvatar.tsx
import { Profile } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, View, useColorScheme } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Avatar } from "../avatars/Avatar";
import BlurButton2 from "../buttons/BlurButton2";

interface ShareProfileCardProps {
  profile: Profile;
}

export default function ShareProfileCardWithAvatar({ profile }: ShareProfileCardProps) {
  const deepLink = `roarapp://profile/${profile.id}`;
  const fallbackLogo = require("../../assets/logo/roar-qr-3.png");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="relative w-full items-center">
      {/* Card */}
      <View className={`p-4 w-full rounded-xl overflow-hidden ${isDark ? "bg-zinc-900" : "bg-white"} pt-28`}>

        {/* Assistant Button */}
        <View className="px-4 mb-2">
          <BlurButton2 readMinutes={1} onPress={() => Alert.alert("This is a preview only.")} />
        </View>

        {/* Text */}
        <View className="flex flex-col justify-center items-center gap-1">
          <Text className={`text-sm font-semibold uppercase my-1 text-center ${isDark ? "text-white" : "text-gray-800"}`}>
            Scan to talk to my assistant
          </Text>
        </View>

        {/* QR Code */}
        <View className="flex items-center my-1">
          <View className="bg-white rounded-lg p-2">
            <QRCode
              value={deepLink}
              size={150}
              logoSize={50}
              logoBorderRadius={10}
              logo={fallbackLogo}
              backgroundColor="#ffffff"
            />
          </View>
        </View>


        <View className="flex flex-row gap-1 justify-center items-center">
          <Ionicons name="call" size={15} color={"green"} />
          <Text className={`text-lg my-1 text-center ${isDark ? "text-white" : "text-gray-800"}`}>
            1 min
          </Text>
          <Text className={`text-lg my-1 text-center ${isDark ? "text-white/50" : "text-gray-800/50"}`}>
            @{profile.handle}
          </Text></View>
      </View>

      {/* Avatar overlapping card */}
      <View className="absolute -top-20">
        <Avatar uri={profile.avatar_url} size={150} plan={profile.plan} />
      </View>
    </View>
  );
}
