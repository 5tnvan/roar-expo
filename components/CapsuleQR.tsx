import React from "react";
import { View, useColorScheme } from "react-native";
import QRCode from "react-native-qrcode-svg";

type CapsuleQRProps = {
  capsuleId: string;
  capsuleImage?: string;
  ownerAvatar?: string;
};

export default function CapsuleQR({
  capsuleId,
  capsuleImage,
  ownerAvatar,
}: CapsuleQRProps) {
  const isDark = useColorScheme() === "dark";

  // Deep link for installed app
  const deepLink = `roarexpo://capsule/${capsuleId}`;

  // Local fallback image (must exist)
  const fallbackLogo = require("../assets/logo/logo.png");

  // Determine logo safely
  const logoSource =
    capsuleImage?.trim()
      ? { uri: `data:image/png;base64,${capsuleImage}` }
      : fallbackLogo; // fallback local asset

  // QR background color for contrast
  const qrBackground = isDark ? "#ffffff" : "#ffffff"; // always white for scan reliability

  return (
    <View
      className={`mx-auto justify-center items-center rounded-lg`}
      style={{ width: 220, height: 220 }} // ensure fixed square size
    >
      <QRCode
        value={deepLink}
        size={200}
        logo={logoSource}
        logoSize={80}
        logoMargin={2}
        logoBorderRadius={8}
        backgroundColor={qrBackground}
      />
    </View>
  );
}
