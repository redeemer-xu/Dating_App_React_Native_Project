import { Image } from "expo-image";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { imageSource } from "../utils/imageSource";
import { colorForName, getInitial } from "../utils/initials";

// Photos you can swipe sideways, with dots that show which photo you are on.
// No photos = big first letter of the name.
// dotsStyle = where the dots go, e.g. { top: 60 } (default: near the bottom)
export default function PhotoGallery({
  images,
  name,
  style,
  dotsStyle = { bottom: 16 },
}) {
  const [width, setWidth] = useState(0); // measured once the gallery is on screen
  const [page, setPage] = useState(0);
  const photos = (images ?? []).filter(Boolean);

  if (photos.length === 0) {
    return (
      <View
        style={[styles.noPhoto, { backgroundColor: colorForName(name) }, style]}
      >
        <Text style={styles.noPhotoLetter}>{getInitial(name)}</Text>
      </View>
    );
  }

  return (
    <View style={style} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setPage(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          onScroll={(e) =>
            setPage(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          scrollEventThrottle={64}
        >
          {photos.map((photo, index) => (
            <Image
              key={index}
              source={imageSource(photo)}
              style={{ width, height: "100%" }}
              contentFit="cover"
            />
          ))}
        </ScrollView>
      ) : null}

      {photos.length > 1 ? (
        <View style={[styles.dots, dotsStyle]} pointerEvents="none">
          {photos.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === page && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  noPhoto: {
    alignItems: "center",
    justifyContent: "center",
  },
  noPhotoLetter: {
    color: "#FFFFFF",
    fontSize: 140,
    fontWeight: "800",
  },
  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },
});
