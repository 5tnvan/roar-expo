import AppButton from "@/components/buttons/AppButton";
import { dancingPills } from "@/constants/DancingPills";
import { inspirations } from "@/constants/Inspo";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/services/providers/AuthProvider";
import { uploadToBunny } from "@/utils/bunny/uploadToBunny";
import { generateContentFromGemini } from "@/utils/gemini/gemini";
import { insertCapsule } from "@/utils/supabase/crudCapsule";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PdfViewerModal from "./modals/pdf_viewer";
import PreviewModal from "./modals/preview";

type pdfFile = {
  name: string;
  content: string;
  charCount: number;
  uri: string;
  blob: Blob;
};

export default function CreateCapsule() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  //context
  const { isAuthenticated, user } = useAuth();
  //title + content
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  //loading
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isLoadingPublish, setIsLoadingPublish] = useState(false);
  // dancing pill or img
  const [selectedMascot, setSelectedMascot] = useState(0);
  const [customMascot, setCustomMascot] = useState<string | null>(null);
  const [finalMascot, setFinalMascot] = useState<string | null>(null);
  // modals (preview, pdf)
  const [showPreviewModal, setshowPreviewModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [uploadPdfMode, setUploadPdfMode] = useState(false);
  const [pdfFile, setPdfFile] = useState<pdfFile | null>(null);

  const getTitleFromContent = () => {
    if (content && content.length > 0) {
      return content.replace(/[\r\n]+/g, " ").slice(0, 350); // strip newlines + limit
    }
    return "";
  };

  const getMascotUrl = () => {
    if (customMascot && selectedMascot === -1) {
      // Custom mascot selected
      return customMascot;
    } else if (selectedMascot >= 0 && selectedMascot < dancingPills.length) {
      // Default mascot selected
      return dancingPills[selectedMascot].image;
    } else {
      // Fallback to first mascot
      return dancingPills[0].image;
    }
  }

  const handleChooseMascotGif = async () => {
    // Pick an image (GIF)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      // Save the selected GIF URI
      const uri = result.assets[0].uri;
      setCustomMascot(uri);
      setSelectedMascot(-1); // select last index (custom mascot)
    }
  };

  const handleChooseInspo = (item: any) => {
    setTitle(item.title);
    setContent(item.content);
  }

  const handlePdfExtract = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });

    if (!result.canceled) {
      const file = result.assets[0];

      // Fetch file as Blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Build FormData for immediate upload
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name || "capsule.pdf",
        type: file.mimeType || "application/pdf",
      } as any);

      console.log("Uploading file to OCR:", file.uri, file.name);

      const ocrResponse = await fetch("http://192.168.0.184:9001/ocr-extract-pdf-text", {
        method: "POST",
        body: formData,
      });

      if (!ocrResponse.ok) {
        alert("Failed to extract PDF text");
        return;
      }

      const ocrData = await ocrResponse.json();
      const extractedContent = ocrData.full_text;

      // Save clean info
      setPdfFile({
        name: file.name,
        content: extractedContent,
        charCount: extractedContent.length,
        uri: file.uri,
        blob, // <-- this is your actual file Blob
      });
    }
  };

  const handleGenerateContent = async () => {
    if (!isAuthenticated) {
      Alert.alert("Sign in to continue");
      return;
    }
    setIsLoadingContent(true);
    const promptText = `
    You are an AI assistant that generates a 550 characters minimum message.

    Instructions: ${content ? content : "empty"}

    If there is no instructions, generate a new message.
    If there is instruction, generate a new message based on given instruction.

    Return message only, no other comments. No emojis. No hashtags.
    `;

    const generatedContents = await generateContentFromGemini(promptText);
    setContent(generatedContents);
    setIsLoadingContent(false);
  };

  const handlePrePublish = () => {
    const res = getMascotUrl();
    setFinalMascot(res);
    const title = getTitleFromContent();
    setTitle(title);
    setshowPreviewModal(true);
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      Alert.alert("Sign in to continue");
      return;
    }

    if (!content.trim() || content.trim().length < 550) {
      Alert.alert("Please write a message, 550 characters min.");
      return;
    }
    setIsLoadingPublish(true);
    const res = getMascotUrl();
    setFinalMascot(res);
    const title = getTitleFromContent();

    try {
      let uploadedPdfUrl: string | undefined = undefined;
      let uploadedMascotUrl: string | undefined = undefined;

      // 2️⃣ Upload PDF to Bunny.net (if exists)
      if (pdfFile && pdfFile.charCount > 0) {
        uploadedPdfUrl = await uploadToBunny(pdfFile.blob, "capsule_pdf", pdfFile.name, user?.id);
        console.log("PDF uploaded:", uploadedPdfUrl);
      }

      // 3️⃣ Upload custom mascot GIF (if exists)
      if (customMascot) {
        const mascotFile: any = {
          uri: customMascot,
          type: "image/jpg",
          name: `mascot-${Date.now()}.jpg`,
        };
        uploadedMascotUrl = await uploadToBunny(mascotFile, "capsule_img", mascotFile.name, user?.id);
        console.log("Mascot uploaded:", uploadedMascotUrl);
      }

      // Determine the final mascot URL
      let finalMascotUrl: string | undefined;

      if (customMascot && selectedMascot === -1) {
        // If custom mascot is chosen
        finalMascotUrl = uploadedMascotUrl || customMascot;
      } else if (selectedMascot >= 0 && selectedMascot < dancingPills.length) {
        // If a default mascot is chosen
        finalMascotUrl = dancingPills[selectedMascot].image;
      } else {
        // Fallback: first mascot or null
        finalMascotUrl = dancingPills[0].image;
      }

      // 4️⃣ Insert capsule to Supabase
      const inserted = await insertCapsule(
        user?.id || '',
        title,
        content,
        finalMascotUrl,
        uploadedPdfUrl,
        pdfFile?.content,
      );

      console.log("Capsule inserted:", inserted);

      const { error } = await supabase.from("capsule_like").insert({ capsule_id: inserted.id, liker_id: user?.id });
      if (error) throw error;
      await supabase.rpc("increment_capsule_stats_likes", { capsule: inserted.id });

      // Reset state
      setTitle("");
      setContent("");
      setPdfFile(null);
      setCustomMascot(null);
      setSelectedMascot(0);
      setFinalMascot(null);
      setUploadPdfMode(false);
      setShowPdfModal(false);

      alert("Message published successfully!");
    } catch (err) {
      console.error("Publish error:", err);
      alert("Failed to publish capsule.");
    } finally {
      setIsLoadingPublish(false);
    }
  };

  return (
    <>
      {/* Modals */}
      <PreviewModal visible={showPreviewModal} title={title} content={content} pdf_uri={pdfFile?.uri} pdf_content={pdfFile?.content} img_uri={finalMascot || ''} onClose={() => setshowPreviewModal(false)} />
      <PdfViewerModal visible={showPdfModal} onClose={() => setShowPdfModal(false)} pdfUri={pdfFile?.uri} />

      {/* + New Message */}
      <SafeAreaView edges={['right', 'bottom', 'left']} className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1">

              {/* 🔝 Top Section */}
              <View className="">
                {/* Preview + Submit */}
                <View className="flex-row w-full gap-2 pt-3 px-2">
                  <View className="flex-1">
                    <AppButton title="Preview" variant="dark" size="lg" onPress={handlePrePublish} />
                  </View>
                  <View className="flex-1">
                    <AppButton
                      title={isLoadingPublish ? "Loading" : "Post Message →"}
                      variant="primary"
                      size="lg"
                      onPress={handlePublish}
                    />
                  </View>
                </View>

                {/* Dancing Pills */}
                <View className="mx-2 mt-2">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {/* Add + mascots */}
                    <TouchableOpacity onPress={handleChooseMascotGif} className="mr-2 w-16 h-16 items-center justify-center border-2 border-dashed border-gray-500 rounded-md">
                      <Ionicons name="add-sharp" size={24} color="grey" />
                    </TouchableOpacity>

                    {customMascot && (
                      <TouchableOpacity
                        onPress={() => setSelectedMascot(-1)}
                        className={`mr-2 items-center ${selectedMascot === -1 ? "border-2 border-blue-500 rounded-lg" : ""}`}
                      >
                        <Image source={{ uri: customMascot }} className="w-16 h-16 rounded-md" resizeMode="cover" />
                      </TouchableOpacity>
                    )}

                    {dancingPills.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setSelectedMascot(idx)}
                        className={`mr-2 ${selectedMascot === idx ? "border-2 border-blue-500 rounded-lg" : ""}`}
                      >
                        <Image source={{ uri: item.image }} className="w-16 h-16 rounded-md" resizeMode="contain" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* ✏️ Middle Section */}
              <View className="flex-1 px-2 rounded-lg border border-blue-500 mx-2 mt-2">

                <TextInput
                  placeholder="What's your message?"
                  placeholderTextColor={isDark ? "#aaa" : "#555"}
                  value={content}
                  onChangeText={setContent}
                  multiline
                  autoFocus
                  style={{ fontSize: 18, paddingTop: 10, textAlignVertical: "top" }}
                  className={`${isDark ? "bg-black text-white" : "bg-white text-black"}`}
                />

              </View>

              {/* 🔻 Bottom Section */}
              <View className="pt-3">
                {uploadPdfMode && (
                  <View className="upload-pdf px-2 pb-2">
                    <Pressable
                      onPress={handlePdfExtract}
                      className={`rounded-lg p-6 items-center justify-center border border-dashed ${isDark ? "border-blue-600 bg-zinc-900" : "border-blue-400 bg-zinc-50"
                        }`}
                    >
                      <View className="flex flex-row justify-center items-center gap-1">
                        <Ionicons name="document" size={22} color={isDark ? "white" : "black"} />
                        <Text className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Tap to choose file
                        </Text>
                      </View>

                      <View className="flex flex-row gap-1">
                        {!pdfFile ? (
                          <TouchableOpacity
                            onPress={handlePdfExtract}
                            className="mt-2 bg-blue-500 px-4 py-2 rounded-lg"
                          >
                            <Text className="text-white">Upload PDF</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => setPdfFile(null)}
                            className="mt-2 bg-blue-500 px-4 py-2 rounded-lg"
                          >
                            <Text className="text-white">Remove PDF</Text>
                          </TouchableOpacity>
                        )}

                        {pdfFile && (
                          <TouchableOpacity
                            onPress={() => setShowPdfModal(true)}
                            className="mt-2 bg-blue-500 px-4 py-2 rounded-lg"
                          >
                            <Text className="text-white">View PDF</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {pdfFile && (
                        <>
                          <Text
                            className={`mt-2 ${isDark ? "text-blue-300" : "text-blue-500"
                              } text-lg truncate max-w-[200px]`}
                            numberOfLines={1}
                          >
                            {pdfFile?.name}
                          </Text>
                          <Text
                            className={`${isDark ? "text-gray-500" : "text-gray-500"}`}
                          >
                            {pdfFile.charCount} characters
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                )}

                {/* Inspo Strip */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                  className=""
                >
                  {inspirations.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleChooseInspo(item)}
                      className="flex-1 rounded-lg w-36 border border-gray-500/50 p-2 mr-2"
                    >
                      <Ionicons name="sparkles-outline" size={18} color="grey" />
                      <Text
                        className={`text-sm font-light ${isDark ? "text-white" : "text-black"}`}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Bottom Menu */}
                <View className="flex-row gap-3 px-1">
                  <TouchableOpacity onPress={handleGenerateContent} className="p-2 flex-row gap-1 items-center">
                    {isLoadingContent ? (
                      <ActivityIndicator color={isDark ? "white" : "black"} />
                    ) : (
                      <>
                        <Ionicons name="sparkles-sharp" size={18} color="grey" />
                        <Text className="text-lg text-blue-500">Generate</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setUploadPdfMode(prev => !prev)} className="flex-row gap-1 items-center">
                    <Ionicons name="document" size={18} color="grey" />
                    <Text className="text-lg text-blue-500 truncate max-w-[200px]">
                      {pdfFile?.name || "PDF"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>

    </>
  );
}

