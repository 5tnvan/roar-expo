import { Avatar } from "@/components/Avatar";
import CameraControlButton from "@/components/CameraControlsButton";
import PhotoSnap from "@/components/PhotoSnap";
import BotVisualizer from "@/components/pipecat/BotVizualizer";
import CallButton from "@/components/pipecat/CallButton";
import { usePipecat } from "@/components/pipecat/PipeCat";
import TranscriptionLog from "@/components/pipecat/TranscriptionLog";
import TranscriptionLog2 from "@/components/pipecat/TranscriptionLog2";
import PromptInput from "@/components/PromptInput";
import BreathingBackground from "@/components/ui/FluidAnim";
import PillButton from "@/components/ui/PillButton";
import SnapButton from "@/components/ui/SnapButton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { BlurView } from "expo-blur";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { AppState, Image, Platform, ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MainCamera, { CameraType } from "./camera";

const tabScreens = [
  "CALL",
  "CREATED BY ME",
  "MY FEED",
  "EXPLORE",
  "SEARCH",
  "I APPROVED"
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
  //content
  const { isAuthenticated, user } = useAuth();
  const { profile } = useAuth();
  //status
  const [status, setStatus] = useState(`Hi ${user?.user_metadata.full_name}, what would you like to explore?`);
  //photo
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  //cam
  const cameraRef = useRef<CameraType>(null);
  const [cameraActive, setCameraActive] = useState(false);
  //vision 
  const [detectedPhoto, setDetectedPhoto] = useState<string | null>(null);
  const [detectedClasses, setDetectedClasses] = useState<string[]>([]);
  const [detectedTexts, setDetectedTexts] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  //yoloe text prompt/prompt free
  const [textPromptInput, setTextPromptInput] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  //pipecat
  const { inCall, openCapsule, transcriptionLog, setOpenCapsule, sendCapsule, leave } = usePipecat();

  // call analytics
  const callStartRef = useRef<number | null>(null);
  const [transLog, setTransLog] = useState<string[]>([]);
  const [timerUI, setTimerUI] = useState(0);
  const [callDuration, setCallDuration] = useState(0);

  //TRACK TRANSCRIPTION DURING CALL
  useEffect(() => {
    if (inCall && openCapsule) {
      setTransLog(transcriptionLog.map(entry => entry.text));
    }
  }, [inCall, openCapsule, transcriptionLog]);

  //CALL WITH CAPSULE TRACKING
  useEffect(() => {
    const handleCallEnd = async () => {
      if (!callStartRef.current) return; // nothing to do

      const callEnd = Date.now();
      const durationSeconds = Math.floor((callEnd - callStartRef.current) / 1000);

      // Insert call analytics into Supabase
      if (openCapsule) {
        //1. capsule_call
        const { error } = await supabase.from("capsule_call").insert({
          capsule_id: openCapsule.capsule.id,
          caller_id: user?.id,
          duration: durationSeconds,
          transcript: transLog.join("\n"),
        });
        //2. capsule_stats updates via rpc
        if (error) console.error("Error inserting capsule_call:", error);
        console.log("openCapsule.capsule.id", openCapsule.capsule.id);
        await supabase.rpc("increment_capsule_stats_call_duration", {
          capsule: openCapsule.capsule.id,
          additional_duration: durationSeconds,
        });
      }

      // Reset
      setTransLog([]);
      callStartRef.current = null;
      setCallDuration(0);
    };

    // Case 1: inCall && openCapsule -> keep tracking
    if (inCall && openCapsule && !callStartRef.current) {
      callStartRef.current = Date.now();
      setTransLog([]);
    }

    // Case 2: inCall && !openCapsule -> end call & leave [when user ends mib call with close button]
    if (inCall && callStartRef.current && !openCapsule) {
      handleCallEnd().then(() => leave());
    }

    // Case 3: !inCall && openCapsule -> end call & clear openCapsule [when user ends mib call with call button]
    if (!inCall && openCapsule && callStartRef.current) {
      handleCallEnd().then(() => setOpenCapsule(null));
    }
  }, [inCall, openCapsule]);

  //TIMER UI EFFECT
  useEffect(() => {
    let timer: number;

    if (inCall) {
      // Start timer
      timer = setInterval(() => {
        setTimerUI(prev => prev + 1);
      }, 1000);
    } else {
      // Reset timer when not in call
      setTimerUI(0);
    }

    return () => clearInterval(timer);
  }, [inCall]);

  //CHANGE STATUS
  useEffect(() => {
    const minutes = Math.floor(timerUI / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timerUI % 60).toString().padStart(2, "0");

    if (openCapsule) {
      setStatus(
        `You are calling @${openCapsule.capsule.owner.handle}\n${minutes}:${seconds}`
      );
    } else if (inCall) {
      setStatus(`In call: ${minutes}:${seconds}`);
    } else if (isAuthenticated && !inCall) {
      setStatus(`Hi ${profile?.full_name}, what would you like to explore?`);
    } else if (!isAuthenticated) {
      setStatus(`Welcome to Roar!`);
    }
  }, [inCall, openCapsule, isAuthenticated, profile]);

  //SEND CAPSULE QUEUE
  useEffect(() => {
    if (openCapsule && !openCapsule?.queue) {
      sendCapsule(openCapsule.capsule);
    }
  }, [openCapsule]);

  const handleFlipCamera = () => cameraRef.current?.flip();
  const toggleCamera = () => setCameraActive(prev => !prev);
  const handlePhoto = (photo: any) => {
    //console.log("Photo received in parent!", photo);
    setPhotoUri(photo.path);
    // You can now upload or display this photo
  };

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

      let uri = photo.path; // e.g., "/data/user/0/com.micalabs.roarai/cache/..."
      if (Platform.OS === "android" && !uri.startsWith("file://")) {
        uri = "file://" + uri;
      }

      // Show immediate preview
      setDetectedPhoto(uri);

      // Create FormData
      const formData = new FormData();

      // ✅ React Native expects { uri, name, type } for file
      formData.append("file", {
        uri: uri,
        name: "capture.jpg",
        type: "image/jpeg",
      } as any); // cast to any

      // Append prompt text if exists
      const promptText = items || textPromptInput;
      if (promptText) {
        formData.append("prompts", promptText);
      }

      // Platform-specific API base
      const API_BASE = "http://192.168.0.184:8000";

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

      let uri = photo.path; // e.g., "/data/user/0/com.micalabs.roarai/cache/..."
      if (Platform.OS === "android" && !uri.startsWith("file://")) {
        uri = "file://" + uri;
      }

      // Photo path (local file URI)
      console.log("Captured photo:", uri);

      // Show immediate preview
      setDetectedPhoto(uri);
      setIsDetecting(true);

      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: "capture.jpg",
        type: "image/jpeg",
      } as any);


      const API_BASE = "http://192.168.0.184:8001";

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
      <View className="camera-view flex-1 relative bg-slate-600">
        {cameraActive ? (
          <MainCamera
            ref={cameraRef}
            onPhotoTaken={handlePhoto}
          />
        ) : (
          <>
            <BreathingBackground>
              {openCapsule?.capsule.image_url ? (
                <Image
                  src={openCapsule.capsule.image_url}
                  alt="Capsule"
                  className="w-96 h-96 rounded-3xl object-cover"
                />
              ) : (
                <BotVisualizer size={80} logoSize={100} />
              )}
            </BreathingBackground>
          </>

        )}

      </View>
      <View className="ui-view absolute w-full h-full flex flex-col justify-between">
        <BlurView
          className="top-ui px-4"
          intensity={80}
          tint={
            Platform.OS === "android"
              ? (isDark ? "dark" : "light")   // Android: dark/light
              : (isDark ? "dark" : "light")  // iOS: light/light, or adjust as needed
          }
          experimentalBlurMethod={"dimezisBlurView"}
        >
          <SafeAreaView edges={['right', 'top', 'left']} className="flex flex-row py-5 items-top justify-between">
            {isAuthenticated ? (
              <Link href="/login">
                <Avatar uri={profile?.avatar_url || ''} size={40} showTick />
              </Link>
            ) : (
              <Link href="/login" className="my-auto">
                <Text className="text-white text-lg font-bold">Login</Text>
              </Link>
            )}

            <View className="flex-1 mx-3 justify-center">
              <Text className="text-white text-lg font-normal text-center ">
                {status}
              </Text>
            </View>

            <BotVisualizer size={35} logoSize={32} />
          </SafeAreaView>
        </BlurView>
        <View className="mid-ui flex-1 flex-col justify-between">
          <View className="mid-top">
            <TranscriptionLog />
          </View>
          <View className="mid-mid ">
            <PromptInput
              showPromptInput={showPromptInput}
              textPromptInput={textPromptInput}
              setTextPromptInput={setTextPromptInput}
              handleDetectTextPrompt={handleDetectTextPrompt}
              loading1={loading1}
            />

          </View>
          <View className="mid-bottom relative">
            <View className="absolute bottom-3 right-3 z-10">
              <PillButton />
            </View>



            <View className="layer-1 flex flex-row justify-between items-end mx-2 mb-3">
              <View className="left-image">
                {photoUri && (
                  <PhotoSnap photoUri={detectedPhoto!} onClose={() => setPhotoUri(null)} />
                )}
              </View>


            </View>

            <View className="layer-0 relative ">
              <TranscriptionLog2 />
              {openCapsule?.capsule.image_url && cameraActive && (
                <Image
                  src={openCapsule.capsule.image_url}
                  alt="Capsule"
                  className="w-28 h-28 rounded-3xl absolute bottom-2 right-2 object-cover"
                />
              )}
            </View>


            {openCapsule && (
              <Link href={`/capsule/${openCapsule.capsule.id || ''}`} className="z-20">
                <BlurView intensity={80} tint="light" className={`layer-2 flex flex-row items-start justify-between px-3 py-4 z-20`}>
                  {/* Left side: Avatar + Image + Name */}
                  <View className="flex flex-row items-start flex-1 gap-1">
                    <Image
                      source={{ uri: openCapsule.capsule.owner.avatar_url }}
                      className="w-8 h-8 rounded-full border border-white"
                    />

                    {/* Title and full name */}
                    <View className="flex-1 ml-2">
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        className={`text-lg ${isDark ? "text-white/70" : "text-black/70"}`}
                      >
                        {openCapsule.capsule.title}
                      </Text>
                      <Text className={`text-md opacity-45 mt-1 ${isDark ? "text-white/70" : "text-black/70"}`}>by {openCapsule.capsule.owner.full_name}</Text>
                    </View>
                  </View>
                </BlurView>
              </Link>

            )}


          </View>
        </View>
        <BlurView
          className="bottom-ui w-full"
          intensity={80}
          tint={Platform.OS === "android"
            ? (isDark ? "dark" : "light")   // Android: dark/light
            : (isDark ? "dark" : "light")  // iOS: light/light, or adjust as needed
          }
        >
          <SafeAreaView className={`${Platform.OS === "android" ? "-mt-6" : "-mt-10"
            }`}>
            {/* Scrollable Tabs */}
            <View className="mb-5 h-12 justify-center mx-3">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: "center" }}
              >
                {tabScreens.map((tab) => {
                  if (tab === "CREATED BY ME") {
                    return (
                      <Link
                        key={tab}
                        href="/my_profile"
                        className="mx-3"
                      >
                        <Text className={`text-lg ${isDark ? "text-white" : "text-white"}`}>
                          {tab}
                        </Text>
                      </Link>
                    );
                  }
                  if (tab === "MY FEED") {
                    return (
                      <Link
                        key={tab}
                        href="/feed"
                        className="mx-3"
                      >
                        <Text className={`text-lg ${isDark ? "text-white" : "text-white"}`}>
                          {tab}
                        </Text>
                      </Link>
                    );
                  }
                  if (tab === "EXPLORE") {
                    return (
                      <Link
                        key={tab}
                        href="/explore"
                        className="mx-3"
                      >
                        <Text className={`text-lg ${isDark ? "text-white" : "text-white"}`}>
                          {tab}
                        </Text>
                      </Link>
                    );
                  }
                  if (tab === "SEARCH") {
                    return (
                      <Link
                        key={tab}
                        href="/search"
                        className="mx-3"
                      >
                        <Text className={`text-lg ${isDark ? "text-white" : "text-white"}`}>
                          {tab}
                        </Text>
                      </Link>
                    );
                  }
                  if (tab === "I APPROVED") {
                    return (
                      <Link
                        key={tab}
                        href="/collectible"
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
                        className={`text-lg ${tab === "CALL"
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
            {/* <LookForButton
                active={showPromptInput}
                onPress={() => setShowPromptInput(!showPromptInput)}
                loading={loading1}
              /> */}
            {/* Bottom action buttons */}
            <View
              className={`relative flex-row justify-between items-center px-8  ${Platform.OS === "android" ? "mb-5" : ""
                }`}
            >
              {/* Left camera buttons */}
              <View className="flex-row items-center relative">
                {/* Camera On/Off Toggle */}
                <View className="z-20">
                  <CameraControlButton
                    active={cameraActive}
                    onPress={toggleCamera}
                    isToggle
                    iconOn="videocam-outline"
                    iconOff="videocam-off-outline"
                  />
                </View>

                {/* Flip/Rotate Camera */}
                {cameraActive && (
                  <View className="absolute left-10 top-0 z-10">
                    <CameraControlButton
                      onPress={handleFlipCamera}
                      iconOn="reload-circle-outline"
                      iconOff="sync-circle-outline"
                    />
                  </View>
                )}
              </View>


              {/* Snap button always in center */}
              <View className="absolute left-1/2 z-20">
                <SnapButton onPress={handleDetectPromptFree} loading={loading2} disabled={!cameraActive} />
              </View>

              {/* Call button on the right */}
              <View className=" z-10">
                <CallButton />
              </View>
            </View>

          </SafeAreaView>
        </BlurView>
      </View>
    </>
  );
}
