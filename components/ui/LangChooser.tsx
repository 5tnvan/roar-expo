import { languages } from "@/constants/Languages";
import { LanguageOption } from "@/types/types";
import { useColorScheme } from "nativewind"; // or from "react-native" if you prefer
import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

type LanguageChooserProps = {
  selectedLanguage?: LanguageOption;
  onSelect: (lang: LanguageOption) => void;
};

export function LanguageChooser({ selectedLanguage, onSelect }: LanguageChooserProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [open, setOpen] = useState(false);

  const bgMain = isDark ? "bg-zinc-700" : "bg-zinc-200";
  const bgDropdown = isDark ? "bg-zinc-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-zinc-900";
  const borderColor = isDark ? "border-zinc-700" : "border-zinc-200";

  return (
    <View className="w-full">
      <Pressable
        className={`px-4 py-3 rounded-lg ${bgMain}`}
        onPress={() => setOpen(!open)}
      >
        <Text className={textColor}>
          {selectedLanguage?.label || "Select Language"}
        </Text>
      </Pressable>

      {open && (
        <FlatList
          data={languages}
          keyExtractor={(item) => item.lang_code}
          className={`${bgDropdown} mt-1 rounded-lg max-h-64`}
          style={{ height: 40 }}        // fixed height
          horizontal={true}             // make internal list horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelect(item);
                setOpen(false);
              }}
              className={`px-8 py-3 border-r ${borderColor}`}
            >
              <Text className={textColor}>{item.label}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
