import CallStatsModal from "@/app/modals/call_stats";
import CapsuleShareModal from "@/app/modals/capsule_share";
import LikeStatsModal from "@/app/modals/like_stats";
import MarkdownModal from "@/app/modals/markdown";
import PdfViewer from "@/app/modals/pdf_viewer";
import SubscribeButton from "@/components/buttons/SubButton";
import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { getReadMinutes } from "@/utils/getReadMinutes";
import { updateCapsuleStatsShare } from "@/utils/supabase/crudCapsuleStats";
import { deleteSub, insertSub } from "@/utils/supabase/crudSub";
import { timeAgo } from "@/utils/timeAgo";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import CapsuleQR from "../CapsuleQR";
import { Avatar } from "../avatars/Avatar";
import BlurButton from "../buttons/BlurButton";
import { MinFormatter } from "../helpers/MinFormatter";
import NumberFormatter from "../helpers/NumberFormatter";

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
  const { isAuthenticated, user } = useAuth();
  const [showLikeStats, setLikeStats] = useState(false);
  const [showCallStats, setCallStats] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const readMinutes = getReadMinutes(capsule.content + capsule.pdf_content);
  const [liking, setLiking] = useState(false);
  const [tempLike, setTempLike] = useState<boolean>(capsule.isLiked);
  const [tempLikesCount, setTempLikesCount] = useState<number>(capsule.stats.likes);
  const [shareVisible, setShareVisible] = useState(false);

  const handleOpenCapsule = (capsule: any) => {
    if (isAuthenticated) {
      onReadWithAI(capsule);
    } else {
      Alert.alert("Sign in to continue");
    }
  };

  const handleShare = () => {
    setShareVisible(true);
    if (capsule.id !== "placeholder") {
      updateCapsuleStatsShare(capsule.id);
    }

  };

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
      Alert.alert("You toggled approval just recently.");
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
      Alert.alert("You toggled subs just recently.");
    }
  };

  return (
    <ThemedView
      className={`m-2 mt-0 rounded-lg`}
    >
      <MarkdownModal visible={showMarkdown} content={capsule?.content || ''} onClose={() => setShowMarkdown(false)} />
      <LikeStatsModal visible={showLikeStats} capsule_id={capsule?.id || ''} onClose={() => setLikeStats(false)} />
      <CallStatsModal visible={showCallStats} capsule_id={capsule?.id || ''} onClose={() => setCallStats(false)} />
      <CapsuleShareModal visible={shareVisible} onClose={() => setShareVisible(false)} capsule={capsule} />

      {/* Capsule Image */}
      <View className="relative">
        <Image
          source={{ uri: capsule.image_url }}
          className="w-full rounded-t-lg"
          style={{ aspectRatio: 1 }} // ensures square shape
          resizeMode="cover"
        />
        <View className="absolute w-full top-1/2 -translate-y-1/2">
          <BlurButton
            size={14}
            readMinutes={readMinutes}
            onPress={() => handleOpenCapsule(capsule)}
          />
        </View>
      </View>

      {/* Stats */}
      <View
        className={`flex-row justify-between border-t border-b opacity-80 ${isDark ? "border-zinc-800" : "border-neutral-200"}`}
      >
        {/* Shares */}
        <TouchableOpacity onPress={handleShare} className="flex-row items-center gap-1 p-4">
          <Ionicons name="share-social" size={20} color={isDark ? "white" : "dark"} />
          <ThemedText className="opacity-80"><NumberFormatter value={capsule.stats.share} /></ThemedText>
        </TouchableOpacity>

        {/* Likes */}
        {capsule.id !== "placeholder" ? <TouchableOpacity className="flex-row items-center gap-1 p-4" onPress={handleLike}>
          <Ionicons name={tempLike ? "hand-right-sharp" : "hand-right-outline"} size={18} color={tempLike ? "green" : "grey"} />
          <ThemedText className="opacity-80"><NumberFormatter value={tempLikesCount} /> approved</ThemedText>
        </TouchableOpacity> : <TouchableOpacity className="flex-row items-center gap-1" onPress={() => { Alert.alert("This is a preview only") }}>
          <Ionicons name="hand-right" size={20} color="green" />
          <ThemedText className="opacity-80"><NumberFormatter value={capsule.stats.likes} /></ThemedText>
        </TouchableOpacity>}

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

      {/* Capsule title */}
      <Text
        className={`mt-4 mx-5 text-lg ${isDark ? "text-white" : "text-black"}`}
        numberOfLines={4}
        ellipsizeMode="tail"
      >
        {capsule.id !== "placeholder" ? (
          <Link href={`/profile/${capsule.owner.id}`}>
            <Text className={`text-lg font-normal opacity-50 ${isDark ? "text-white" : "text-black"}`}>
              @{isAuthenticated ? capsule.owner.handle : 'newbie'}{" "}
            </Text>
          </Link>
        ) : (
          <Text className={`text-lg font-normal opacity-50 ${isDark ? "text-white" : "text-black"}`}>
            @{isAuthenticated ? capsule.owner.handle : 'newbie'}{" "}
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


      {/* QR Code wrapped in TouchableOpacity */}
      <TouchableOpacity onPress={handleShare} className="mx-auto m-3">
        <CapsuleQR
          capsule={capsule}
        />
      </TouchableOpacity>



      <View className="flex flex-row gap-1 mx-auto">
        <TouchableOpacity onPress={() => handleOpenCapsule(capsule)} className="flex flex-row justify-center items-center gap-1">
          <Ionicons name="call-outline" size={18} color="grey" />
          <ThemedText>{readMinutes} min call</ThemedText>
        </TouchableOpacity>
        <ThemedText>by</ThemedText>
        {capsule.id !== "placeholder" ? <Link href={`/profile/${capsule.owner.id}`}>
          <Text className={`text-lg font-normal opacity-50 ${isDark ? "text-white" : "text-black"}`}>@{isAuthenticated ? capsule.owner.handle : 'newbie'}
          </Text>
        </Link> : <Text className={`text-lg font-normal opacity-50 ${isDark ? "text-white" : "text-black"}`}> @{isAuthenticated ? capsule.owner.handle : 'newbie'}
        </Text>}

      </View>

      <View className="flex flex-row px-4 py-2 gap-4 items-center justify-center">
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
          <Pressable onPress={() => setLikeStats(true)}><ThemedText className="text-md" type="link">{`View likes`}</ThemedText></Pressable>
        )}
        {capsule.owner.id?.toString() === user?.id?.toString() && capsule.id !== "placeholder" && (
          <Pressable onPress={() => setCallStats(true)}><ThemedText className="text-md" type="link">{`View analytics`}</ThemedText></Pressable>
        )}
      </View>


      {/* Author */}
      {!hideDetails && <View className={`flex flex-row justify-between items-center px-4 p-2 border-t ${isDark ? "border-zinc-800" : "border-neutral-100"
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
              {isAuthenticated && <Avatar uri={capsule.owner.avatar_url} size={30} showTick={true} />}
              <ThemedText className="font-semibold">
                {isAuthenticated ? capsule.owner.full_name : '@newbie'}

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
