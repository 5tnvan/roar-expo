import { Avatar } from "@/components/avatars/Avatar";
import BackgroundNoAnim from "@/components/bg/BackgroundNoAnim";
import AIConvoButton from "@/components/buttons/AIConvoButton";
import BotVisualizer from "@/components/buttons/BotVizualizer";
import CallButton from "@/components/buttons/CallButton";
import CameraControlButton from "@/components/buttons/CameraControlButton";
import PillButton from "@/components/buttons/PillButton";
import MainCamera, { CameraType } from "@/components/camera/camera";
import CapsulesLoader from "@/components/CapsuleLoader";
import { SlideRightView } from "@/components/FadeView";
import { usePipecat } from "@/components/providers/PipeCatProvider";
import TranscriptionLog from "@/components/transcript/TranscriptionLog";
import TranscriptionLog2 from "@/components/transcript/TranscriptionLog2";
import ScrollableMenu from "@/components/ui/ScrollableMenu";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/services/providers/AuthProvider";
import { BlurView } from "expo-blur";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Image, Platform, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Login from "./login";

export default function Index() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  //context
  const { isAuthenticated, user, profile } = useAuth();
  //login
  const [loginVisible, setLoginVisible] = useState(false);
  //status
  const [status, setStatus] = useState(`Hi ${user?.user_metadata.full_name}, what would you like to explore?`);
  //cam
  const cameraRef = useRef<CameraType>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [showPosts, setShowPosts] = useState(true);

  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();
  
  //pipecat
  const { isLoading, inCall, openCapsule, openConvoSession, sendConvoSession, sendCapsule } = usePipecat();
  
  // call analytics
  const [timerUI, setTimerUI] = useState(0);

  //TIMMER + STATUS
  useEffect(() => {
    const minutes = Math.floor(timerUI / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timerUI % 60).toString().padStart(2, "0");

    // Update status text
    if (inCall && openCapsule) {
      setStatus(
        `Calling @${openCapsule.capsule.owner.handle || ''}\n${minutes}:${seconds}`
      );
    } else if (inCall && openConvoSession) {
      setStatus(`Calling @${openConvoSession?.callee_profile.handle || ''} assistant\n${minutes}:${seconds}`);
    }
    else if (inCall && !openCapsule) {
      setStatus(`In call: ${minutes}:${seconds}`);
    } else if (isAuthenticated && !inCall) {
      setStatus(`Hey, ${profile?.full_name || ''}, what would you like to explore?`);
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
      sendConvoSession(openConvoSession.callee_profile, openConvoSession.convo_session_id, openConvoSession.convo_session_reply_id);
    }
  }, [openConvoSession]);

  const handleTabAction = (tab: string) => {
    if (tab === "EXPLORE") {
      // Toggle showPosts when flame icon is pressed
      setShowPosts((prev) => !prev);
    }
    // Handle other custom tab actions here if needed
  };

  const handleFlipCamera = () => cameraRef.current?.flip();
  const toggleCamera = () => setCameraActive(prev => !prev);
  return (
    <>
      <Login visible={loginVisible} onClose={() => setLoginVisible(false)} />
      <View className="camera-view flex-1 relative bg-slate-600">
        {cameraActive ? (
  <MainCamera ref={cameraRef} />
) : (
  <BackgroundNoAnim>
    {/* Call (cap or prof) */}
    {openCapsule ? (
      <Image
        src={openCapsule.capsule.image_url}
        alt="Capsule"
        className="w-96 h-96 rounded-3xl object-cover"
      />
    ) : (!openCapsule && openConvoSession) ? (
      <Image
        src={openConvoSession.callee_profile.avatar_url}
        alt="Profile"
        className="w-96 h-96 rounded-3xl object-cover"
      />
    ) : null}

    {/* Basic call */}
    {(inCall || isLoading || !showPosts) && (!openCapsule?.capsule.id && !openConvoSession?.callee_profile.id) ? (
      <View className="justify-center h-full items-center">
        <BotVisualizer size={130} logoSize={140} />
      </View>
    ) : (showPosts && user?.id && (!openCapsule?.capsule.id && !openConvoSession?.callee_profile.id)) ? (

        <SlideRightView show={showPosts}>
          <CapsulesLoader userId={user?.id} />
        </SlideRightView>

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
                {unreadCount > 0 ? <Avatar uri={profile?.avatar_url || ''} size={40} showNotif /> : <Avatar uri={profile?.avatar_url || ''} size={40} plan={profile?.plan} />}
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
        <View className="relative mid-ui flex-1 flex-col justify-between">


          <View className="mid-top">
            <TranscriptionLog />
          </View>
          <View className="mid-mid ">
            
          </View>
          <View className="mid-bottom relative">
            <View className="absolute bottom-3 right-2 z-10">
              <PillButton />
            </View>
            <View className="layer-1 flex flex-row justify-between items-end mx-2 mb-3">
              <View className="left-image">
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
                      <Text className={`text-md opacity-45 mt-1 ${isDark ? "text-white/70" : "text-black/70"}`}>@{openConvoSession.callee_profile.handle}</Text>
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
            <ScrollableMenu onTabAction={handleTabAction} showPosts={showPosts} />
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
