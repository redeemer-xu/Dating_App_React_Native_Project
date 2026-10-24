import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

const THUMB_SIZE = 22;
const HIT_SLOP = { top: 14, bottom: 14, left: 8, right: 8 };

export default function Slider({ min, max, value, step = 1, onChange }) {
  const [trackWidth, setTrackWidth] = useState(0);

  const percentFor = (v) => (max === min ? 0 : (v - min) / (max - min));

  // Turn the finger position into a value and send it up
  const handleTouch = (evt) => {
    if (!trackWidth) return;
    const x = evt.nativeEvent.locationX; // measured from the left of the track
    const pct = Math.min(1, Math.max(0, x / trackWidth));
    const raw = min + pct * (max - min);
    const stepped = Math.round(raw / step) * step;
    onChange(Math.min(max, Math.max(min, stepped)));
  };

  const pct = percentFor(value);

  return (
    <View
      style={styles.track}
      hitSlop={HIT_SLOP}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={handleTouch}
      onResponderMove={handleTouch}
    >
      <View pointerEvents="none" style={styles.trackBg} />
      <View
        pointerEvents="none"
        style={[styles.trackFill, { width: `${pct * 100}%` }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          { left: Math.max(0, pct * trackWidth - THUMB_SIZE / 2) },
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
