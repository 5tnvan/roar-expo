import { useAuth } from "@/services/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Modal, Pressable, Text, View, useColorScheme } from "react-native";

interface CapsuleMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onFlag: () => void;
  onArchive: () => void;
  capsuleOwnerId: string;
}

export default function CapsuleMenuModal({
  visible,
  onClose,
  onFlag,
  onArchive,
  capsuleOwnerId,
}: CapsuleMenuModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  const isOwner = user?.id === capsuleOwnerId;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 justify-end bg-black/50"
      >
        <View className={`bg-white dark:bg-zinc-900 rounded-t-xl p-4`}>
          <Pressable
            onPress={() => {
              onFlag();
              onClose();
            }}
            className="flex-row items-center gap-3 py-3"
          >
            <Ionicons name="flag-outline" size={20} color="red" />
            <Text className={`text-lg ${isDark ? "text-white" : "text-black"}`}>
              Flag
            </Text>
          </Pressable>

          {isOwner && (
            <Pressable
              onPress={() => {
                Alert.alert(
                  "Archive Capsule",
                  "Are you sure you want to archive this capsule?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Archive",
                      style: "destructive",
                      onPress: () => {
                        onArchive();
                        onClose();
                      },
                    },
                  ]
                );
              }}
              className="flex-row items-center gap-3 py-3"
            >
              <Ionicons name="archive-outline" size={20} color="gray" />
              <Text className={`text-lg ${isDark ? "text-white" : "text-black"}`}>
                Archive
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={onClose}
            className="flex-row items-center justify-center py-3 mt-2 border-t border-gray-200 dark:border-zinc-700"
          >
            <Text className={`text-lg ${isDark ? "text-white" : "text-black"}`}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
