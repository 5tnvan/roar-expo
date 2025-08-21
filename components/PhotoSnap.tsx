import React, { useRef } from "react";
import { Animated, Dimensions, Image, PanResponder } from "react-native";

type PhotoSnapProps = {
  photoUri: string;
  onClose: () => void;
};

export default function PhotoSnap({ photoUri, onClose }: PhotoSnapProps) {
  const { height: screenHeight } = Dimensions.get("window");

  const initialWidth = 120;
  const initialHeight = 210;

  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        // only vertical drag
        let newY = gesture.dy;

        // clamp so the photo doesn't go off screen
        const maxY = screenHeight / 2 - initialHeight / 2;
        const minY = -maxY;
        newY = Math.max(Math.min(newY, maxY), minY);

        translate.setValue({ x: 0, y: newY });
      },
      onPanResponderRelease: (_, gesture) => {
        // if dragged far vertically, close the photo
        if (Math.abs(gesture.dy) > 150) {
          onClose();
        } else {
          // reset position
          Animated.spring(translate, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!photoUri) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        width: initialWidth,
        height: initialHeight,
        transform: translate.getTranslateTransform(),
        alignSelf: "center",
        zIndex: 1000,
      }}
    >
      <Image
        source={{ uri: photoUri }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 20,
          borderWidth: 2,
          borderColor: "white",
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
