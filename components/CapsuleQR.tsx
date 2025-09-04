import { fallbackLogo } from "@/constants/Logos";
import { Capsule } from "@/types/types";
import React from "react";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type CapsuleQRProps = {
  capsule: Capsule;
};

export default function CapsuleQR({ capsule }: CapsuleQRProps) {
  const deepLink = `roarapp://capsule/${capsule.id}`;

  return (
    <View
      style={{
        width: 150,
        height: 150,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
      }}
    >
      <QRCode
        value={deepLink}
        size={150}
        logo={fallbackLogo}
        logoSize={50}
        logoMargin={1}
        logoBorderRadius={10}
        backgroundColor="#ffffff"
      />
    </View>
  );
}
