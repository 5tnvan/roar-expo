import * as Device from "expo-device";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";

export default function TabCamera() {
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();

  // Disable camera on simulators
  const isSimulator = Platform.OS === "ios" && !Device.isDevice;

  if (isSimulator) {
    return (
      <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Camera disabled on simulator</Text>
      </View>
    );
  }

  if (!hasPermission) {
    requestPermission();
    return <SafeAreaView><Text className="">Requesting camera permission...</Text></SafeAreaView>;
  }

  if (!device) {
    return <Text>No camera device found</Text>;
  }

  return <Camera style={StyleSheet.absoluteFill} device={device} isActive />;
}
