// /app/pdfviewer.tsx
import { ThemedText } from "@/components/template/ThemedText";
import { ThemedView } from "@/components/template/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import Pdf from "react-native-pdf";

type Props = {
  visible: boolean;
  onClose: () => void;
  pdfUri?: string | null;
};

export default function PdfViewerModal({ visible, onClose, pdfUri }: Props) {
  if (!pdfUri) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4">
          <ThemedText className="text-white text-lg font-semibold">PDF View (visible to me only)</ThemedText>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="p-2">
                      <ThemedText className="text-blue-400">Close</ThemedText>
                    </TouchableOpacity>
        </View>

        {/* PDF Viewer */}
        <View className="flex-1 w-full">
          <Pdf
            source={{ uri: pdfUri }}
            style={{ flex: 1, width: "100%" }}
            trustAllCerts={false}
            enablePaging={true}
          />
        </View>
      </ThemedView>
    </Modal>
  );
}
