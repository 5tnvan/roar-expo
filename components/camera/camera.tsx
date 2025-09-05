import * as Device from "expo-device";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from "react-native-vision-camera";

export type CameraType = {
  takePhoto: () => Promise<PhotoFile>;
  startRecording: () => void;
  stopRecording: () => void;
  flip: () => void;
};

type MainCameraProps = {
  onPhotoTaken?: (photo: PhotoFile) => void;
};

const MainCamera = forwardRef<CameraType, MainCameraProps>(({ onPhotoTaken }, ref) => {
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">("back");
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  // Optional: constrain format if device supports it
  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 720 } },
  ]);

  useImperativeHandle(ref, () => ({
    takePhoto: async (): Promise<PhotoFile> => {
      if (!cameraRef.current) throw new Error("Camera not ready");
      const photo = await cameraRef.current.takePhoto();
      if (onPhotoTaken) onPhotoTaken(photo);
      return photo;
    },
    startRecording: () => cameraRef.current?.startRecording(),
    stopRecording: () => cameraRef.current?.stopRecording(),
    flip: () => setCameraPosition(prev => (prev === "back" ? "front" : "back")),
  }));

  if (Platform.OS === "ios" && !Device.isDevice) {
    return (
      <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Camera disabled on simulator</Text>
      </View>
    );
  }

  if (!hasPermission) {
    requestPermission();
    return (
      <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
        <Text>No camera device found</Text>
      </View>
    );
  }

  return (
    <Camera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive
      photo
      format={format}
    />
  );
});

MainCamera.displayName = "MainCamera";
export default MainCamera;
