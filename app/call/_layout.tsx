import { Avatar } from "@/components/avatars/Avatar";
import BackgroundNoAnim from "@/components/bg/BackgroundNoAnim";
import AIConvoButton from "@/components/buttons/AIConvoButton";
import BotVisualizer from "@/components/buttons/BotVizualizer";
import CallButton from "@/components/buttons/CallButton";
import CameraControlButton from "@/components/buttons/CameraControlButton";
import PhotoSnap from "@/components/buttons/PhotoSnapButton";
import PillButton from "@/components/buttons/PillButton";
import InfinitePeekCarousel from '@/components/InfiniteScroll';
import PromptInput from "@/components/PromptInput";
import { usePipecat } from "@/components/providers/PipeCatProvider";
import TranscriptionLog from "@/components/transcript/TranscriptionLog";
import TranscriptionLog2 from "@/components/transcript/TranscriptionLog2";
import ScrollableMenu from "@/components/ui/ScrollableMenu";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { BlurView } from "expo-blur";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { AppState, Image, Platform, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginModal from "../login";
import MainCamera, { CameraType } from "./camera";


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
  const { isAuthenticated, user, profile } = useAuth();
  //login
  const [loginVisible, setLoginVisible] = useState(false);
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

  console.log("pro", profile?.gemini_api_key);

  //pipecat
  const { isLoading, inCall, openCapsule, openConvoSession, transcriptionLog, setOpenCapsule, setOpenConvoSession, sendConvoSession, sendCapsule, leave } = usePipecat();
  // call analytics
  const capsuleCallStartRef = useRef<number | null>(null);
  const profileCallStartRef = useRef<number | null>(null);
  const [timerUI, setTimerUI] = useState(0);

  //CALL WITH CAPSULE TRACKING
  useEffect(() => {
    const handleCallEnd = async () => {
      if (!capsuleCallStartRef.current) return; // nothing to do

      const callEnd = Date.now();
      const durationSeconds = Math.floor((callEnd - capsuleCallStartRef.current) / 1000);

      // Insert call analytics into Supabase
      if (openCapsule) {
        //1. capsule_call
        const { error } = await supabase.from("capsule_call").insert({
          capsule_id: openCapsule.capsule.id,
          caller_id: user?.id,
          duration: durationSeconds,
          transcript: transcriptionLog,
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
      capsuleCallStartRef.current = null;
    };

    // Case 1: inCall && openCapsule -> keep tracking
    if (inCall && openCapsule && !capsuleCallStartRef.current) {
      capsuleCallStartRef.current = Date.now();
    }

    // Case 2: inCall && !openCapsule -> end call & leave [when user ends mib call with close button]
    if (inCall && capsuleCallStartRef.current && !openCapsule) {
      handleCallEnd().then(() => leave());
    }

    // Case 3: !inCall && openCapsule -> end call & clear openCapsule [when user ends mib call with call button]
    if (!inCall && openCapsule && capsuleCallStartRef.current) {
      handleCallEnd().then(() => setOpenCapsule(null));
    }
  }, [inCall, openCapsule]);

  //CALL ASSIST WITH TRACKING
  useEffect(() => {
    const handleCallEnd = async () => {
      if (!profileCallStartRef.current) return; // nothing to do

      const callEnd = Date.now();
      const durationSeconds = Math.floor((callEnd - profileCallStartRef.current) / 1000);

      // Insert call analytics into Supabase
      if (openConvoSession) {
        const { error } = await supabase
          .from("convo_session")
          .update({
            duration: durationSeconds,
            transcript: transcriptionLog,
          })
          .eq("id", openConvoSession.convo_session_id);

        if (error) {
          console.error("Error updating convo_session:", error);
        }
      }

      // Reset
      profileCallStartRef.current = null;
    };

    // Case 1: inCall && openCapsule -> keep tracking
    if (inCall && openConvoSession && !profileCallStartRef.current) {
      profileCallStartRef.current = Date.now();
    }

    // Case 2: inCall && !openCapsule -> end call & leave [when user ends mib call with close button]
    if (inCall && profileCallStartRef.current && !openConvoSession) {
      handleCallEnd().then(() => leave());
    }

    // Case 3: !inCall && openCapsule -> end call & clear openCapsule [when user ends mib call with call button]
    if (!inCall && openConvoSession && profileCallStartRef.current) {
      handleCallEnd().then(() => setOpenConvoSession(null));
    }
  }, [inCall, openConvoSession]);


  useEffect(() => {
    const minutes = Math.floor(timerUI / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timerUI % 60).toString().padStart(2, "0");

    // Update status text
    if (openCapsule) {
      setStatus(
        `Calling @${openCapsule.capsule.owner.handle}\n${minutes}:${seconds}`
      );
    } else if (inCall) {
      setStatus(`Calling @${openConvoSession?.callee_profile.handle} assistant\n${minutes}:${seconds}`);
    }
    else if (inCall) {
      setStatus(`In call: ${minutes}:${seconds}`);
    } else if (isAuthenticated && !inCall) {
      setStatus(`Hey, ${profile?.full_name}, what would you like to explore?`);
    } else if (!isAuthenticated) {
      setStatus(`Hey, I'm Roar. Let's start?`);
    }

    // Determine if we should run timer
    const callActive = openCapsule || openConvoSession || inCall;

    if (!callActive) {
      // stop timer & reset
      setTimerUI(0);
      return;
    }

    // Start timer
    const timer = setInterval(() => {
      setTimerUI(prev => prev + 1);
    }, 1000);

    // Cleanup on call end or dependency change
    return () => clearInterval(timer);

  }, [inCall, openCapsule, openConvoSession, isAuthenticated, profile, timerUI]);

  //SEND CAPSULE QUEUE
  useEffect(() => {
    if (openCapsule && !openCapsule?.queue) {
      sendCapsule(openCapsule.capsule);
    }
  }, [openCapsule]);

  //SEND PROFILE QUEUE
  useEffect(() => {
    if (openConvoSession && !openConvoSession?.queue) {
      sendConvoSession(openConvoSession.callee_profile, openConvoSession.convo_session_id);
    }
  }, [openConvoSession]);

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
      <LoginModal
        visible={loginVisible}
        onClose={() => setLoginVisible(false)}
      />

      <View className="camera-view flex-1 relative bg-slate-600">
        {cameraActive ? (
          <MainCamera
            ref={cameraRef}
            onPhotoTaken={handlePhoto}
          />
        ) : (
          <BackgroundNoAnim>
            {openCapsule?.capsule.image_url ? (
              <Image
                src={openCapsule.capsule.image_url}
                alt="Capsule"
                className="w-96 h-96 rounded-3xl object-cover"
              />
            ) : openConvoSession?.callee_profile.avatar_url ? (
              <Image
                src={openConvoSession.callee_profile.avatar_url}
                alt="Capsule"
                className="w-96 h-96 rounded-3xl object-cover"
              />
            ) : isLoading || inCall ? (
              <BotVisualizer size={140} logoSize={140} />
            ) : !isLoading && !inCall ? (
              <InfinitePeekCarousel />
            ) : null}
          </BackgroundNoAnim>

        )}

      </View>
      <View className="ui-view absolute w-full h-full flex flex-col justify-between">
        <BlurView
          className="top-ui px-4"
          intensity={80}
          tint={isDark ? "dark" : "light"}
          experimentalBlurMethod={"dimezisBlurView"}
        >
          <SafeAreaView edges={['right', 'top', 'left']} className="flex flex-row py-5 items-top justify-between">
            {isAuthenticated ? (
              <Link href="/account">
                <Avatar uri={profile?.avatar_url || ''} size={40} showTick />
              </Link>
            ) : (
              <TouchableOpacity onPress={() => setLoginVisible(true)}><Text className="text-white text-lg py-2 font-bold">Login</Text></TouchableOpacity>
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
              {openConvoSession?.callee_profile.avatar_url && cameraActive && (
                <Image
                  src={openConvoSession?.callee_profile.avatar_url}
                  alt="Capsule"
                  className="w-28 h-28 rounded-3xl absolute bottom-2 right-2 object-cover"
                />
              )}
            </View>
            {openCapsule && (
              <Link href={`/capsule/${openCapsule.capsule.id || ''}`} className="z-20">
                <BlurView intensity={80}
                  tint={isDark ? "dark" : "light"}
                  experimentalBlurMethod={"dimezisBlurView"}
                  className={`layer-2 flex flex-row items-start justify-between px-3 py-4 z-20`}>
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
            {openConvoSession && (
              <Link href={`/profile/${openConvoSession.callee_profile.id || ''}`} className="z-20">
                <BlurView intensity={80} tint={isDark ? "dark" : "light"}
                  experimentalBlurMethod={"dimezisBlurView"} className={`layer-2 flex flex-row items-start justify-between px-3 py-4 z-20`}>
                  {/* Left side: Avatar + Image + Name */}
                  <View className="flex flex-row items-start flex-1 gap-1">
                    <Image
                      source={{ uri: openConvoSession.callee_profile.avatar_url }}
                      className="w-8 h-8 rounded-full border border-white"
                    />

                    {/* Title and full name */}
                    <View className="flex-1 ml-2">
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        className={`text-lg ${isDark ? "text-white/70" : "text-black/70"}`}
                      >
                        {openConvoSession.callee_profile.full_name}
                      </Text>
                      <Text className={`text-md opacity-45 mt-1 ${isDark ? "text-white/70" : "text-black/70"}`}>{openConvoSession.callee_profile.handle}</Text>
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
          tint={isDark ? "dark" : "light"}
          experimentalBlurMethod={"dimezisBlurView"}
        >
          <SafeAreaView className={`${Platform.OS === "android" ? "-mt-6" : "-mt-10"
            }`}>
            <ScrollableMenu />
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
              {/* <View className="absolute left-1/2 z-20">
                <SnapButton onPress={handleDetectPromptFree} loading={loading2} disabled={!cameraActive} />
              </View> */}

              <View className="absolute left-1/2 z-20">
                <AIConvoButton />
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
