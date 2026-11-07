import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { imageSource } from "../utils/imageSource";
import { colorForName, getInitial } from "../utils/initials";

export default function DiscoveryCard({ profile, onPress }) {
  const photos = (profile.images ?? []).filter(Boolean);
  const [photoIndex, setPhotoIndex] = useState(0); // which photo is showing
  const hasMany = photos.length > 1;

  // tap the left side = previous photo, right side = next photo
  const prevPhoto = () => setPhotoIndex((i) => Math.max(0, i - 1));
  const nextPhoto = () =>
    setPhotoIndex((i) => Math.min(photos.length - 1, i + 1));

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={onPress}
      disabled={!onPress}
    >
      {photos.length > 0 ? (
        <Image
          source={imageSource(photos[photoIndex])}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      ) : (
        // no photo: big first letter on a colored background
        <View
          style={[
            styles.noPhoto,
            { backgroundColor: colorForName(profile.name) },
          ]}
        >
          <Text style={styles.noPhotoLetter}>{getInitial(profile.name)}</Text>
        </View>
      )}
      {hasMany ? (
        <>
          {/* little bars at the top: one per photo */}
          <View style={styles.bars} pointerEvents="none">
            {photos.map((_, i) => (
              <View
                key={i}
                style={[styles.bar, i === photoIndex && styles.barActive]}
              />
            ))}
          </View>
          {/* invisible tap areas on the left and right side of the photo */}
          <View style={styles.tapZones} pointerEvents="box-none">
            <Pressable style={styles.tapSide} onPress={prevPhoto} />
            <View style={styles.tapMiddle} pointerEvents="none" />
            <Pressable style={styles.tapSide} onPress={nextPhoto} />
          </View>
        </>
      ) : null}
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", "rgba(15,15,17,0.55)", "rgba(15,15,17,0.95)"]}
        locations={[0, 0.55, 1]}
        style={styles.overlay}
      >
        <View style={styles.tagRow}>
          {profile.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.name}>
          {profile.name}
          <Text style={styles.age}>, {profile.age}</Text>
        </Text>
        <Text style={styles.meta}>{profile.title}</Text>
        <Text style={styles.meta}>{profile.distance}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bars: {
    position: "absolute",
    top: 10,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 4,
    zIndex: 2,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  barActive: {
    backgroundColor: "#FFFFFF",
  },
  tapZones: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 170, // stop above the name/info area (tapping there opens the profile)
    flexDirection: "row",
    zIndex: 1,
  },
  tapSide: {
    flex: 1,
  },
  tapMiddle: {
    flex: 1,
  },
  noPhoto: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },
  noPhotoLetter: {
    color: "#FFFFFF",
    fontSize: 140,
    fontWeight: "800",
  },
  card: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 80,
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    color: colors.textOnDark,
    fontSize: 12,
    fontWeight: "600",
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textOnDark,
  },
  age: {
    fontSize: 22,
    fontWeight: "500",
    color: colors.textOnDarkSecondary,
  },
  meta: {
    fontSize: 14,
    color: colors.textOnDarkSecondary,
    marginTop: 2,
  },
});
