import * as Device from "expo-device";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Camera, PhotoFile, useCameraDevice, useCameraFormat, useCameraPermission } from "react-native-vision-camera";

export type CameraType = {
  takePhoto: () => Promise<PhotoFile>;
  startRecording: () => void;
  stopRecording: () => void;
};

type MainCameraProps = {
  onPhotoTaken?: (photo: any) => void; // callback when photo is taken
};

const MainCamera = forwardRef<CameraType, MainCameraProps>(({ onPhotoTaken }, ref) => {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  // Optional: constrain format if device supports it
  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 720 } }
  ]);

  useImperativeHandle(ref, () => ({
    takePhoto: async (): Promise<PhotoFile> => {
      if (!cameraRef.current) {
        throw new Error("Camera not ready");
      }

      const photo = await cameraRef.current.takePhoto();
      if (onPhotoTaken) onPhotoTaken(photo);
      return photo; // always returns a PhotoFile
    },
    startRecording: () => cameraRef.current?.startRecording(),
    stopRecording: () => cameraRef.current?.stopRecording(),
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
    return <Text>Requesting camera permission...</Text>;
  }

  if (!device) return <Text>No camera device found</Text>;

  return (
    <Camera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      device={device}
      photo
      isActive
      format={format}
    />
  );
});

MainCamera.displayName = "MainCamera";

export default MainCamera;
