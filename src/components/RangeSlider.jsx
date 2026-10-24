import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

const THUMB_SIZE = 22;
const MIN_GAP = 1;
const HIT_SLOP = { top: 14, bottom: 14, left: 8, right: 8 };

export default function RangeSlider({ min, max, value, onChange }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const activeThumb = useRef("low"); // which circle is being dragged (only used inside touch handlers)
  const [low, high] = value;

  const toPct = (v) => (max === min ? 0 : (v - min) / (max - min));
  const toValue = (x) => {
    const pct = Math.min(1, Math.max(0, x / trackWidth));
    return Math.round(min + pct * (max - min));
  };

  // Move one circle to finger position x (measured from the left of the track)
  const moveThumb = (x, thumb) => {
    if (!trackWidth) return;
    const next = toValue(x);
    if (thumb === "low") {
      onChange([Math.min(next, high - MIN_GAP), high]);
    } else {
      onChange([low, Math.max(next, low + MIN_GAP)]);
    }
  };

  // Finger touches down: pick the circle closest to the finger
  const handleGrant = (evt) => {
    const x = evt.nativeEvent.locationX;
    const lowX = toPct(low) * trackWidth;
    const highX = toPct(high) * trackWidth;
    const thumb = Math.abs(x - lowX) <= Math.abs(x - highX) ? "low" : "high";
    activeThumb.current = thumb;
    moveThumb(x, thumb);
  };

  // Finger moves: keep moving the same circle
  const handleMove = (evt) => {
    moveThumb(evt.nativeEvent.locationX, activeThumb.current);
  };

  const lowPct = toPct(low);
  const highPct = toPct(high);

  return (
    <View
      style={styles.track}
      hitSlop={HIT_SLOP}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={handleGrant}
      onResponderMove={handleMove}
    >
      <View pointerEvents="none" style={styles.trackBg} />
      <View
        pointerEvents="none"
        style={[
          styles.trackFill,
          { left: `${lowPct * 100}%`, right: `${(1 - highPct) * 100}%` },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          { left: Math.max(0, lowPct * trackWidth - THUMB_SIZE / 2) },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          { left: Math.max(0, highPct * trackWidth - THUMB_SIZE / 2) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: THUMB_SIZE,
    justifyContent: "center",
  },
  trackBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardAlt,
  },
  trackFill: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.textOnDark,
    borderWidth: 3,
    borderColor: colors.accent,
  },
});
