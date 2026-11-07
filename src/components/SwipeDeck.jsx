import { Heart, X } from "lucide-react-native";
import { useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import DiscoveryCard from "./DiscoveryCard";

const RED = "#FF4D4F";
const GREEN = "#2ECC71";

// One profile card you can swipe, plus the X / heart buttons.
// Swipe (or tap) left = pass, swipe (or tap) right = like.
// HomeScreen gives it a new "key" for every profile, so each card starts fresh.
export default function SwipeDeck({ profile, onPass, onLike, onOpenProfile }) {
  const { width } = useWindowDimensions();
  const threshold = width * 0.25; // how far you must drag before it counts

  // Where the card is: x = left/right, y = up/down (starts in the middle)
  const [position] = useState(() => new Animated.ValueXY());
  const [leaving, setLeaving] = useState(false); // true while the card flies away

  // Make the card fly off the screen, then tell HomeScreen (like or pass)
  const flyOut = (direction, endY = 0) => {
    setLeaving(true);
    Animated.timing(position, {
      toValue: { x: direction * width * 1.5, y: endY },
      duration: 250,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished) return;
      if (direction > 0) onLike();
      else onPass();
    });
  };

  // Put the card back in the middle (dragged, but not far enough)
  const springBack = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  // Follows your finger while dragging the card
  const [panResponder] = useState(() =>
    PanResponder.create({
      // only take over when you drag sideways (a tap still opens the profile)
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > threshold) flyOut(1, gesture.dy);
        else if (gesture.dx < -threshold) flyOut(-1, gesture.dy);
        else springBack();
      },
      onPanResponderTerminate: () => springBack(),
      onPanResponderTerminationRequest: () => false,
    }),
  );

  // ---- animations that follow the card's x position ----
  // the card tilts a little
  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ["-12deg", "0deg", "12deg"],
  });
  // right side: LIKE stamp, heart grows
  const likeAmount = position.x.interpolate({
    inputRange: [0, threshold],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  // left side: NOPE stamp, X grows
  const nopeAmount = position.x.interpolate({
    inputRange: [-threshold, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const likeScale = likeAmount.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });
  const passScale = nopeAmount.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  return (
    <>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
            ],
          },
        ]}
        pointerEvents={leaving ? "none" : "auto"}
        {...panResponder.panHandlers}
      >
        <DiscoveryCard profile={profile} onPress={onOpenProfile} />

        <Animated.View
          style={[styles.stamp, styles.likeStamp, { opacity: likeAmount }]}
          pointerEvents="none"
        >
          <Text style={[styles.stampText, { color: GREEN }]}>LIKE</Text>
        </Animated.View>
        <Animated.View
          style={[styles.stamp, styles.nopeStamp, { opacity: nopeAmount }]}
          pointerEvents="none"
        >
          <Text style={[styles.stampText, { color: RED }]}>NOPE</Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.actions}>
        {/* X button: grows when swiping left */}
        <Animated.View style={{ transform: [{ scale: passScale }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={leaving}
            onPress={() => flyOut(-1)}
            style={[styles.circle, styles.small, { borderColor: RED }]}
          >
            <X size={26} color={RED} strokeWidth={3} />
          </TouchableOpacity>
        </Animated.View>

        {/* Heart button: grows when swiping right */}
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={leaving}
            onPress={() => flyOut(1)}
            style={[styles.circle, styles.big, { borderColor: colors.accent }]}
          >
            <Heart size={30} color={colors.accent} fill={colors.accent} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    minHeight: 360,
  },
  stamp: {
    position: "absolute",
    top: 40,
    borderWidth: 4,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  likeStamp: {
    left: 24,
    borderColor: GREEN,
    transform: [{ rotate: "-15deg" }],
  },
  nopeStamp: {
    right: 24,
    borderColor: RED,
    transform: [{ rotate: "15deg" }],
  },
  stampText: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    paddingVertical: 18,
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 2,
  },
  small: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  big: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
