import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

const THUMB_SIZE = 22;

export default function Slider({ min, max, value, step = 1, onChange }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const percentFor = (v) => (max === min ? 0 : (v - min) / (max - min));

  // Measure the track on layout, then respond directly to the touch's x
  // position within it — simpler and more reliable than accumulating deltas.
  const handleTouch = (evt) => {
    if (!trackWidth) return;
    const x = evt.nativeEvent.locationX;
    const pct = Math.min(1, Math.max(0, x / trackWidth));
    const raw = min + pct * (max - min);
    const stepped = Math.round(raw / step) * step;
    onChange(Math.min(max, Math.max(min, stepped)));
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleTouch,
      onPanResponderMove: handleTouch,
    })
  ).current;

  const pct = percentFor(value);

  return (
    <View
      style={styles.track}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      {...responder.panHandlers}
    >
      <View style={styles.trackBg} />
      <View style={[styles.trackFill, { width: `${pct * 100}%` }]} />
      <View
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
    justifyContent: 'center',
  },
  trackBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardAlt,
  },
  trackFill: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.textOnDark,
    borderWidth: 3,
    borderColor: colors.accent,
  },
});
