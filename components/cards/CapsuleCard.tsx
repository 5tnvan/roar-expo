import CallStatsModal from "@/app/(home)/modals/call_stats";
import CapsuleCommentsModal from "@/app/(home)/modals/capsule_comments";
import CapsuleMenuModal from "@/app/(home)/modals/capsule_menu";
import CapsuleShareModal from "@/app/(home)/modals/capsule_share";
import LikeStatsModal from "@/app/(home)/modals/like_stats";
import MarkdownModal from "@/app/(home)/modals/markdown";
import PdfViewerModal from "@/app/(home)/modals/pdf_viewer";
import SubscribeButton from "@/components/buttons/SubButton";
import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { formatNumber } from "@/utils/formatters/formatNumbers";
import { formatSecIntoMins } from "@/utils/formatters/formatSecIntoMins";
import { getReadMinutesFromContent } from "@/utils/formatters/getReadMinutesFromContent";
import { timeAgo } from "@/utils/formatters/timeAgo";
import { archiveCapsule } from "@/utils/supabase/crudCapsule";
import { insertFlaggedCapsule } from "@/utils/supabase/crudCapsuleFlagged";
import { updateCapsuleStatsShare } from "@/utils/supabase/crudCapsuleStats";
import { deleteSub, insertSub } from "@/utils/supabase/crudSub";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Avatar } from "../avatars/Avatar";
import BlurButton2 from "../buttons/BlurButton2";
import CapsuleQR from "../CapsuleQR";
import { TruncatedText } from "../TruncateText";

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
  const readMinutes = getReadMinutesFromContent(capsule.content + capsule.pdf_content);
  const [liking, setLiking] = useState(false);
  const [tempLike, setTempLike] = useState<boolean>(capsule.isLiked);
  const [tempLikesCount, setTempLikesCount] = useState<number>(capsule.stats.likes);
  const [shareVisible, setShareVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

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

  const handleFlag = async () => {
    console.log(capsule.id, user?.id || '')
    const res = await insertFlaggedCapsule(capsule.id, user?.id || '');
    setMenuVisible(false);
    if (res) Alert.alert("Message flagged!");
  };

  const handleArchive = async () => {
    const res = await archiveCapsule(capsule.id);
    console.log("capsule.id", capsule.id);
    setMenuVisible(false);
    if (res) Alert.alert("Message archived!");
  };

  return (
    <ThemedView
      className={`m-2 mt-0 rounded-lg`}
    >
      <MarkdownModal visible={showMarkdown} content={capsule?.content || ''} onClose={() => setShowMarkdown(false)} />
      <LikeStatsModal visible={showLikeStats} capsule_id={capsule?.id || ''} onClose={() => setLikeStats(false)} />
      <CallStatsModal visible={showCallStats} capsule_id={capsule?.id || ''} onClose={() => setCallStats(false)} />
      <CapsuleShareModal visible={shareVisible} onClose={() => setShareVisible(false)} capsule={capsule} />
      <CapsuleMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        capsuleOwnerId={capsule.owner.id}
        onFlag={handleFlag}
        onArchive={handleArchive}
      />
      <CapsuleCommentsModal visible={showCommentsModal} onClose={() => setShowCommentsModal(false)} capsule_id={capsule.id} />

      {/* Capsule Image */}
      <Pressable onPress={() => { }} className="relative">
        <Image
          source={{ uri: capsule.image_url }}
          className="w-full rounded-t-lg"
          style={{ aspectRatio: 1 }} // ensures square shape
          resizeMode="cover"
        />

      </Pressable>


      {/* Stats */}
      <View
        className={`flex-row justify-between border-t border-b opacity-80 px-4 ${isDark ? "border-zinc-800" : "border-neutral-200"}`}
      >
        {/* Shares */}
        <TouchableOpacity onPress={handleShare} className="flex-row items-center gap-1 py-4">
          <Ionicons name="share-social" size={20} color={isDark ? "white" : "dark"} />
          <ThemedText className="opacity-80">{formatNumber(capsule.stats.share)}</ThemedText>
        </TouchableOpacity>

        {/* Likes */}
        {capsule.id !== "placeholder" ? <TouchableOpacity className="flex-row items-center gap-1 py-4" onPress={handleLike}>
          <Ionicons name={tempLike ? "hand-right-sharp" : "hand-right-outline"} size={18} color={tempLike ? "green" : "grey"} />
          <ThemedText className="opacity-80">{formatNumber(tempLikesCount)}</ThemedText>
        </TouchableOpacity> : <TouchableOpacity className="flex-row items-center gap-1" onPress={() => { Alert.alert("This is a preview only") }}>
          <Ionicons name="hand-right" size={20} color="green" />
          <ThemedText className="opacity-80">{formatNumber(capsule.stats.likes)}</ThemedText>
        </TouchableOpacity>}

        {/* Total Duration */}
        <View className="flex-row items-center gap-1 py-4">
          <Ionicons name="call" size={18} color="red" />
          <ThemedText className="opacity-80">
            {formatSecIntoMins(capsule.stats.duration)}
          </ThemedText>
        </View>

        {/* Comments */}
        <TouchableOpacity onPress={() => setShowCommentsModal(true)} className="flex-row items-center gap-1 py-4">
          <Ionicons name="chatbox-ellipses-outline" size={18} color={isDark ? "white" : "dark"} />
          {
            capsule.stats.comments > 0 && <ThemedText className="opacity-80">
              {formatNumber(capsule.stats.comments)}
            </ThemedText>
          }
          
        </TouchableOpacity>

        {/* Views */}
        <View className="flex-row items-center gap-1 py-4">
          <Ionicons name="eye-outline" size={20} color={isDark ? "white" : "dark"} />
          <ThemedText className="opacity-80">
            {formatNumber(capsule.stats.views)}
          </ThemedText>
        </View>

        {/* Three vertical dots menu */}
        {capsule.id !== "placeholder" && <Pressable className="flex-row items-center py-4" onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color={isDark ? "white" : "black"} />
        </Pressable>}

      </View>

      <View className="px-4 py-3">
        <BlurButton2
          size={14}
          readMinutes={readMinutes as number}
          onPress={() => handleOpenCapsule(capsule)}
        />
      </View>

      

      {/* Capsule title */}
      <Text
        className={`mx-5 text-lg ${isDark ? "text-white" : "text-black"}`}
        numberOfLines={4}
        ellipsizeMode="tail"
      >
        {capsule.id !== "placeholder" ? (
          <>
          <ThemedText className="text-sm font-medium">
            {timeAgo(capsule.created_at)} ago{` `}
          </ThemedText>
          </>
        ) : (
          <>
          <Text className={`text-lg font-normal ${isDark ? "text-white/50" : "text-black/50"}`}>
            @{isAuthenticated ? capsule.owner.handle : 'newbie'}{" "}
          </Text>
          </>
        )}
        {capsule.id !== "placeholder" ? (
          <Link href={`/capsule/${capsule.id}`} className="z-20">
            {capsule.title.replace(/[\r\n]+/g, " ")}
          </Link>
        ) : (
          capsule.title.replace(/[\r\n]+/g, " ")
        )}
      </Text>
      {/* Call action */}
      <View className="flex flex-row gap-1 mx-auto mt-2">
        <TouchableOpacity onPress={() => handleOpenCapsule(capsule)} className="flex flex-row justify-center items-center gap-1">
          <Ionicons name="call-outline" size={18} color="grey" />
          <Text className="text-black/50 dark:text-white/50 text-lg">{readMinutes} min call</Text>
        </TouchableOpacity>
                  <Link href={`/profile/${capsule.owner.id}`}>
            <Text className={`text-lg font-normal ${isDark ? "text-white/50" : "text-black/50"}`}>
              @{isAuthenticated ? capsule.owner.handle : 'newbie'}{" "}
            </Text>
          </Link>
      </View>

      {/* QR Code wrapped in TouchableOpacity */}
      <TouchableOpacity onPress={handleShare} className="mx-auto m-3">
        <CapsuleQR
          capsule={capsule}
        />
      </TouchableOpacity>

      {/* Internal analytics */}
      {capsule.owner.id?.toString() === user?.id?.toString() && (
        <View className="flex flex-row px-4 pb-2 gap-4 items-center justify-center">

          {capsule.pdf_url && (
            <Pressable onPress={() => setShowPdfModal(true)}>
              <ThemedText className="text-md" type="link">View PDF</ThemedText>
              <PdfViewerModal
                visible={showPdfModal}
                onClose={() => setShowPdfModal(false)}
                pdfUri={encodeURI(capsule.pdf_url)}
              />
            </Pressable>
          )}

          <Pressable onPress={() => setShowMarkdown(true)}>
            <ThemedText className="text-md" type="link">View message</ThemedText>
          </Pressable>

          {capsule.id !== "placeholder" && (
            <>
              <Pressable onPress={() => setLikeStats(true)}>
                <ThemedText className="text-md" type="link">View likes</ThemedText>
              </Pressable>

              <Pressable onPress={() => setCallStats(true)}>
                <ThemedText className="text-md" type="link">View analytics</ThemedText>
              </Pressable>
            </>
          )}

        </View>
      )}

      {/* Author */}
      {!hideDetails && <View className={`flex flex-row justify-between items-center px-2 p-2 border-t ${isDark ? "border-zinc-800" : "border-neutral-100"
        }`}>
        <View className="flex flex-row items-center gap-2">
          {capsule.id !== "placeholder" ? (
            <Link href={`/profile/${capsule.owner.id}`}>
              <View className="flex flex-row items-center gap-2">
                <Avatar uri={capsule.owner.avatar_url} size={40} showTick={true} plan={capsule.owner.plan} />
                <ThemedText className="font-semibold">
                  <TruncatedText text={capsule.owner.full_name} maxLength={20} />
                </ThemedText>
              </View>
            </Link>
          ) : (
            <View className="flex flex-row items-center gap-2">
              {isAuthenticated && <Avatar uri={capsule.owner.avatar_url} size={30} showTick={true} plan={capsule.owner.plan} />}
              <ThemedText className="font-semibold">
                {isAuthenticated ? capsule.owner.full_name : '@newbie'}
              </ThemedText>
            </View>
          )}

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
