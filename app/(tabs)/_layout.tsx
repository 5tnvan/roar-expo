import LookForButton from "@/components/LookForButton";
import PhotoSnap from "@/components/PhotoSnap";
import PromptInput from "@/components/PromptInput";
import AnimPressable from "@/components/ui/AnimPressable";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Link } from "expo-router";
import React, { useRef, useState } from "react";
import { AppState, Image, Platform, Pressable, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MainCamera, { CameraType } from "./camera";

const tabScreens = [
  "CAMERA",
  "HOW-TO",
  "DOWNLOADS",
  "PLACEHOLDER1",
  "PLACEHOLDER2",
  "PLACEHOLDER3",
];

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isAuthenticated, user } = useAuth();

  const cameraRef = useRef<CameraType>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  //pass 
  const [detectedPhoto, setDetectedPhoto] = useState<string | null>(null);
  const [detectedClasses, setDetectedClasses] = useState<string[]>([]);
  const [detectedTexts, setDetectedTexts] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  //yoloe text prompt/prompt free
  const [textPromptInput, setTextPromptInput] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handlePhoto = (photo: any) => {
    //console.log("Photo received in parent!", photo);
    setPhotoUri(photo.path);
    // You can now upload or display this photo
  };

  const handleTakePhoto = () => cameraRef.current?.takePhoto();
  const handleStartRecording = () => cameraRef.current?.startRecording();
  const handleStopRecording = () => cameraRef.current?.stopRecording();


  const handleDetectTextPrompt = async (items?: string) => {
  try {
    console.log("handleDetectTextPrompt fired", textPromptInput);

    // Reset state
    setDetectedPhoto(null);
    setDetectedClasses([]);
    setLoading1(true);
    setIsDetecting(true);

    if (!cameraRef.current) {
      console.warn("Camera not ready");
      setLoading1(false);
      setIsDetecting(false);
      return;
    }

    // Take photo with VisionCamera
    const photo = await cameraRef.current.takePhoto();
    console.log("Captured photo:", photo.path);

    // Show immediate preview
    setDetectedPhoto(photo.path);

    // Create FormData
    const formData = new FormData();

    // ✅ React Native expects { uri, name, type } for file
    formData.append("file", {
      uri: photo.path,
      name: "capture.jpg",
      type: "image/jpeg",
    } as any); // cast to any

    // Append prompt text if exists
    const promptText = items || textPromptInput;
    if (promptText) {
      formData.append("prompts", promptText);
    }

    // Platform-specific API base
    const API_BASE =
      Platform.OS === "ios"
        ? "http://192.168.0.184:8000"
        : Platform.OS === "android"
        ? "http://10.0.2.2:8000"
        : "http://192.168.0.184:8000";

    console.log("API_BASE", API_BASE);

    const response = await fetch(`${API_BASE}/detect-with-prompts`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Ensure classes array exists
    const detectedClasses = data.classes ?? [];
    const imageUrl = `data:image/jpeg;base64,${data.image_base64}`;

    setDetectedPhoto(imageUrl);
    setDetectedClasses(detectedClasses);
    console.log("Detected classes:", detectedClasses);

    // Optional: send to voice device
    // if (pipecatRef.current?.isConnected) {
    //   handleSendClassesToVoice(detectedClasses, {});
    // }

    // Cleanup
    setShowPromptInput(false);
    setTextPromptInput("");
  } catch (error) {
    console.error("Error calling detect API:", error);
  } finally {
    setLoading1(false);
    setIsDetecting(false);
  }
};


  const handleDetectPromptFree = async () => {
    console.log("handleDetectPromptFree fired");
    setLoading2(true);
    setDetectedPhoto(null);
    setDetectedClasses([]);

    try {
      if (!cameraRef.current) {
        setLoading2(false);
        return;
      }

      // Take a photo with VisionCamera
      const photo = await cameraRef.current.takePhoto();

      // Photo path (local file URI)
      console.log("Captured photo:", photo.path);

      // Show immediate preview
      setDetectedPhoto(photo.path);
      setIsDetecting(true);

      const formData = new FormData();
      formData.append("file", {
        uri: photo.path,
        name: "capture.jpg",
        type: "image/jpeg",
      } as any);


      const API_BASE =
        Platform.OS === "ios"
          ? "http://192.168.0.184:8001"
          : Platform.OS === "android"
            ? "http://10.0.2.2:8001"
            : "http://192.168.0.184:8001"; // fallback for real devices

      console.log("API_BASE", API_BASE);

      const res1 = await fetch(`${API_BASE}/detect-image`, {
        method: "POST",
        body: formData,
      });

      if (!res1.ok) {
        throw new Error(`HTTP error! status: ${res1.status}`);
      }

      const data1 = await res1.json();

      // Show detected image returned by server
      const imgUrl1 = `data:image/jpeg;base64,${data1.image_base64}`;
      setDetectedPhoto(imgUrl1);

      // Store detected classes
      setDetectedClasses(data1.classes);
      console.log("Detected classes:", data1.classes);

      setIsDetecting(false);
    } catch (error) {
      console.error("Error calling detect API:", error);
    } finally {
      setLoading2(false);
    }
  };


  return (
    <>
      <View className="camera-view flex-1 relative">
        <MainCamera ref={cameraRef} onPhotoTaken={handlePhoto} />
      </View>
      <View className="top-view absolute w-full h-full flex flex-col justify-between">
        <BlurView className="px-4" intensity={100} tint={isDark ? "dark" : "light"}>
          <SafeAreaView className="mt-5">
            {isAuthenticated ?
              <Link className="" href="/login">
                <Image src={user?.user_metadata.avatar_url} className="rounded-full w-12 h-12 bg-cover border-2 border-green-600" />
              </Link>
              :
              <Link className="" href="/login">
                <Text className="text-white text-lg font-bold ml-2">Login</Text>
              </Link>
            }

          </SafeAreaView>
        </BlurView>
        <View className="mid-view flex-1 flex-col justify-between">
          <View className="mid-top bg-orange-500"></View>
          <View className="mid-mid "><PromptInput
            showPromptInput={showPromptInput}
            textPromptInput={textPromptInput}
            setTextPromptInput={setTextPromptInput}
            handleDetectTextPrompt={handleDetectTextPrompt}
            loading1={loading1}
          /></View>
          <View className="mid-bottom">
            <View className="layer-1 flex flex-row justify-between items-end mx-2 mb-3">
              <View className="left-image">
                {photoUri && (
                  <PhotoSnap photoUri={detectedPhoto!} onClose={() => setPhotoUri(null)} />
                )}
              </View>
              <Pressable className="plus-button"><Ionicons name="add-outline" size={20} color="black" className="p-4 rounded-full bg-white" /></Pressable>
            </View>
            <View className="layer-2">

            </View>
          </View>

        </View>

        <BlurView
          className="bottom-view w-full"
          intensity={100}
          tint={isDark ? "dark" : "light"}
        >
          <SafeAreaView className="-mt-6">
            {/* Scrollable Tabs */}
            <View className="mb-10 h-12 justify-center mx-3">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: "center" }}
              >
                {tabScreens.map((tab) => {
                  if (tab === "HOW-TO") {
                    return (
                      <Link
                        key={tab}
                        href="/users_manuals"
                        className="mx-3"
                      >
                        <Text className={`text-lg ${isDark ? "text-white" : "text-white"}`}>
                          {tab}
                        </Text>
                      </Link>
                    );
                  }
                  if (tab === "DOWNLOADS") {
                    return (
                      <Link
                        key={tab}
                        href="/inspection_mods"
                        className="mx-3"
                      >
                        <Text className={`text-lg ${isDark ? "text-white" : "text-white"}`}>
                          {tab}
                        </Text>
                      </Link>
                    );
                  }
                  // CAMERA or other placeholders
                  return (
                    <TouchableOpacity key={tab} className="mx-3">
                      <Text
                        className={`text-lg ${tab === "CAMERA"
                          ? "text-white font-bold"
                          : isDark
                            ? "text-white"
                            : "text-white"
                          }`}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Bottom action buttons */}
            <View className="flex-row justify-around items-center mb-3">
              <LookForButton
                active={showPromptInput}
                onPress={() => setShowPromptInput(!showPromptInput)}
                loading={loading1}
              />

              <AnimPressable onPress={handleDetectPromptFree} loading={loading2} />

              <Pressable onPress={handleTakePhoto} className="px-7 py-3 rounded-full bg-gray-600">
                <Ionicons name="mic" size={20} color="white" />
              </Pressable>
            </View>
          </SafeAreaView>
        </BlurView>
      </View>

    </>

  );
}
