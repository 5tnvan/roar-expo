import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export default function CustomAlert() {
  const [visible, setVisible] = useState(false);

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-black">
      {/* Show Alert Button */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="px-4 py-3 bg-green-600 rounded-lg"
      >
        <Text className="text-white font-semibold">Show Alert</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal transparent visible={visible} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="w-4/5 rounded-2xl p-6 items-center bg-white dark:bg-gray-800">
            {/* Title */}
            <Text className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              ⚠️ Warning
            </Text>

            {/* Message */}
            <Text className="text-center text-gray-700 dark:text-gray-300 mb-5">
              This is a custom styled alert in React Native.
            </Text>

            {/* Actions */}
            <View className="flex-row w-full">
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="flex-1 px-4 py-2 mr-2 rounded-lg bg-gray-200 dark:bg-gray-700 items-center"
              >
                <Text className="text-gray-800 dark:text-gray-200">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="flex-1 px-4 py-2 ml-2 rounded-lg bg-green-600 items-center"
              >
                <Text className="text-white font-semibold">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
