import CallStats from "@/app/callstats";
import LikeStats from "@/app/likestats";
import MarkdownBasic from "@/app/markdown";
import PdfViewer from "@/app/pdf_viewer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import CallAIButton from "@/components/ui/CallAIButton";
import SubscribeButton from "@/components/ui/SubButton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { getReadMinutes } from "@/utils/getReadMinutes";
import { deleteSub, insertSub } from "@/utils/supabase/crudSub";
import { timeAgo } from "@/utils/timeAgo";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Avatar } from "./Avatar";
import CapsuleQR from "./CapsuleQR";
import { MinFormatter } from "./MinFormatter";
import NumberFormatter from "./ui/NumberFormatter";

interface CapsuleCardProps {
  capsule: Capsule;
  hideDetails?: boolean;
  onReadWithAI: (capsule: Capsule) => void;
  onToggleSub: (ownerId: string, newSub: boolean) => void;
}

const CapsuleCard: React.FC<CapsuleCardProps> = ({
  capsule,
  hideDetails,
  onReadWithAI,
  onToggleSub,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const [showLikeStats, setLikeStats] = useState(false);
  const [showCallStats, setCallStats] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const readMinutes = getReadMinutes(capsule.content + capsule.pdf_content);
  const [liking, setLiking] = useState(false);
  const [tempLike, setTempLike] = useState<boolean>(capsule.isLiked);
  const [tempLikesCount, setTempLikesCount] = useState<number>(capsule.stats.likes);

  const handleLike = async () => {
    if (!user?.id || liking) return;
    setLiking(true);

    const newLikeState = !tempLike;
    setTempLike(newLikeState);
    setTempLikesCount(prev => prev + (newLikeState ? 1 : -1));

    try {
      if (newLikeState) {
        const { error } = await supabase.from("capsule_like").insert({ capsule_id: capsule.id, liker_id: user.id });
        if (error) throw error;
        await supabase.rpc("increment_capsule_stats_likes", { capsule: capsule.id });
      } else {
        const { error } = await supabase.from("capsule_like").delete().eq("capsule_id", capsule.id).eq("liker_id", user.id);
        if (error) throw error;
        await supabase.rpc("decrement_capsule_stats_likes", { capsule: capsule.id });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setTempLike(capsule.isLiked);
      setTempLikesCount(capsule.stats.likes);
    } finally {
      setLiking(false);
    }
  };

  const toggleSubscribe = async () => {
    if (!user) return;

    try {
      if (capsule.owner.isSub) {
        const res = await deleteSub(capsule.owner.id, user.id);
        if (res) onToggleSub(capsule.owner.id, false);
      } else {
        const res = await insertSub(capsule.owner.id, user.id);
        if (res) onToggleSub(capsule.owner.id, true);
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
    }
  };

  return (
    <ThemedView
      className={`m-2 mt-0 rounded-lg`}
    >
      <MarkdownBasic visible={showMarkdown} content={capsule?.content || ''} onClose={() => setShowMarkdown(false)} />
      <LikeStats visible={showLikeStats} capsule_id={capsule?.id || ''} onClose={() => setLikeStats(false)} />
      <CallStats visible={showCallStats} capsule_id={capsule?.id || ''} onClose={() => setCallStats(false)} />

      {/* Capsule Image */}
      <View className="relative">
        <Image
          source={{ uri: capsule.image_url }}
          className="w-full rounded-t-lg"
          style={{ aspectRatio: 1 }} // ensures square shape
          resizeMode="cover"
        />
        <View className="absolute w-full top-1/2 -translate-y-1/2">
          <CallAIButton
            onPress={() => onReadWithAI(capsule)}
            size={18}
            readMinutes={readMinutes}
          />
        </View>
      </View>

      {/* Stats */}
      <View
        className={`flex-row justify-between border-t border-b opacity-80 ${isDark ? "border-zinc-800" : "border-neutral-200"}`}
      >
        {/* Shares */}
        <View className="flex-row items-center gap-1 p-4">
          <Ionicons name="share-social" size={20} color={isDark ? "white" : "dark"} />
          <ThemedText className="opacity-80"><NumberFormatter value={capsule.stats.share} /></ThemedText>
        </View>

        {/* Likes */}
        {capsule.id !== "placeholder" ? <TouchableOpacity className="flex-row items-center gap-1 p-4" onPress={handleLike}>
          <Ionicons name={tempLike ? "hand-right-sharp" : "hand-right-outline"} size={18} color={tempLike ? "green" : "grey"} />
          <ThemedText className="opacity-80"><NumberFormatter value={tempLikesCount} /> approved</ThemedText>
        </TouchableOpacity> : <TouchableOpacity className="flex-row items-center gap-1" onPress={() => { Alert.alert("This is a preview only") }}>
          <Ionicons name="hand-right" size={20} color="green" />
          <ThemedText className="opacity-80"><NumberFormatter value={capsule.stats.likes} /> approved</ThemedText>
        </TouchableOpacity>}


        {/* Calls */}
        {/* <View className="flex-row items-center gap-1">
          <Ionicons name="call" size={20} color="green" />
          <ThemedText className="opacity-80"><NumberFormatter value={capsule.stats.calls} /></ThemedText>
        </View> */}

        {/* Duration */}
        <View className="flex-row items-center gap-1 p-4">
          <Ionicons name="call" size={18} color="red" />
          <ThemedText className="opacity-80">
            <MinFormatter seconds={capsule.stats.duration} />
          </ThemedText>
        </View>

        

        {/* Views */}
        <View className="flex-row items-center gap-1 p-4">
          <Ionicons name="eye-outline" size={20} color={isDark ? "white" : "dark"} />
          <ThemedText className="opacity-80"><NumberFormatter value={capsule.stats.views} /></ThemedText>
        </View>
      </View>




      {/* Capsule Name */}

      <Text
        className={`mt-4 mx-5 text-lg ${isDark ? "text-white" : "text-black"}`}
        numberOfLines={4}
        ellipsizeMode="tail"
      >
        {capsule.id !== "placeholder" ? (
          <Link href={`/profile/${capsule.owner.id}`}>
          <Text className={`text-lg font-normal opacity-50 ${isDark ? "text-white" : "text-black"}`}>
            @{capsule.owner.handle}{" "}
          </Text>
        </Link>
        ) : (
          <Text className={`text-lg font-normal opacity-50 ${isDark ? "text-white" : "text-black"}`}>
            @{capsule.owner.handle}{" "}
          </Text>
        )}
        

        {capsule.id !== "placeholder" ? (
          <Link href={`/capsule/${capsule.id}`} className="z-20">
            {capsule.title.replace(/[\r\n]+/g, " ")}
          </Link>
        ) : (
          capsule.title.replace(/[\r\n]+/g, " ")
        )}
      </Text>

      {/* QR Code */}
      <View
        className={`mx-auto my-5 flex-1 flex-row justify-center rounded-lg`}
      >
        <CapsuleQR capsuleId={capsule.id} capsuleImage={capsule.image_url} />
      </View>

      <View className="flex flex-row gap-1 mx-auto">
        <View className="flex flex-row justify-center items-center gap-1">
          <Ionicons name="call-outline" size={20} color="grey" />
          <ThemedText>{readMinutes} min call</ThemedText>
        </View>
        <ThemedText>by</ThemedText>
        {capsule.id !== "placeholder" ? <Link href={`/profile/${capsule.owner.id}`}>
          
          <Text className={`text-lg font-normal opacity-50 ${isDark ? "text-white" : "text-black"}`}> @{capsule.owner.handle}
          </Text>
        </Link> : <Text className={`text-lg font-normal opacity-50 ${isDark ? "text-white" : "text-black"}`}> @{capsule.owner.handle}
          </Text>}
        
      </View>

      <View className="flex flex-row p-4 gap-4 items-center justify-center">
        {capsule.owner.id?.toString() === user?.id?.toString() && capsule.pdf_url && (
          <Pressable onPress={() => setShowPdfModal(true)}>
            <ThemedText className="text-md" type="link">{`View PDF`}</ThemedText>
            <PdfViewer visible={showPdfModal} onClose={() => setShowPdfModal(false)} pdfUri={encodeURI(capsule.pdf_url)} />
          </Pressable>
        )}
        {capsule.owner.id?.toString() === user?.id?.toString() && (
          <Pressable onPress={() => setShowMarkdown(true)}><ThemedText className="text-md" type="link">{`View message`}</ThemedText></Pressable>
        )}
        {capsule.owner.id?.toString() === user?.id?.toString() && capsule.id !== "placeholder" && (
          <Pressable onPress={() => setLikeStats(true)}><ThemedText className="text-md" type="link">{`View Likes`}</ThemedText></Pressable>
        )}
        {capsule.owner.id?.toString() === user?.id?.toString() && capsule.id !== "placeholder" && (
          <Pressable onPress={() => setCallStats(true)}><ThemedText className="text-md" type="link">{`View Calls`}</ThemedText></Pressable>
        )}
      </View>


      {/* Author */}
      {!hideDetails && <View className={`flex flex-row justify-between items-center p-4 border-t ${isDark ? "border-zinc-800" : "border-neutral-100"
        }`}>
        <View className="flex flex-row items-center gap-2">
          {capsule.id !== "placeholder" ? (
            <Link href={`/profile/${capsule.owner.id}`}>
              <View className="flex flex-row items-center gap-2">
                <Avatar uri={capsule.owner.avatar_url} size={30} showTick={true} />
                <ThemedText className="font-semibold">
                  {capsule.owner.full_name}
                </ThemedText>
              </View>
            </Link>
          ) : (
            <View className="flex flex-row items-center gap-2">
              <Avatar uri={capsule.owner.avatar_url} size={30} showTick={true} />
              <ThemedText className="font-semibold">
                {capsule.owner.full_name}
              </ThemedText>
            </View>
          )}

          <ThemedText className="opacity-50 text-sm font-medium">
            {timeAgo(capsule.created_at)}
          </ThemedText>

        </View>

        <View className="flex flex-row gap-2 items-center">
          {capsule.id !== "placeholder" ? <SubscribeButton
            subscribed={capsule.owner.isSub}
            onPress={toggleSubscribe}
          />
            : <SubscribeButton
              subscribed={false}
              size="sm"
              onPress={() => Alert.alert("This is a preview only.")}
            />}

        </View>
      </View>}

    </ThemedView>
  );
};

export default CapsuleCard;
