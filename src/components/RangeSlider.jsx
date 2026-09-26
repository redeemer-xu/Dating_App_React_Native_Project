import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

const THUMB_SIZE = 22;
const MIN_GAP = 1;

export default function RangeSlider({ min, max, value, onChange }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [low, high] = value;

  const toPct = (v) => (max === min ? 0 : (v - min) / (max - min));
  const toValue = (x) => {
    const pct = Math.min(1, Math.max(0, x / trackWidth));
    return Math.round(min + pct * (max - min));
  };

  const makeResponder = (thumb) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        if (!trackWidth) return;
        const next = toValue(evt.nativeEvent.locationX);
        if (thumb === 'low') {
          onChange([Math.min(next, high - MIN_GAP), high]);
        } else {
          onChange([low, Math.max(next, low + MIN_GAP)]);
        }
      },
    });

  const lowResponder = useRef(makeResponder('low')).current;
  const highResponder = useRef(makeResponder('high')).current;

  const lowPct = toPct(low);
  const highPct = toPct(high);

  return (
    <View style={styles.track} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
      <View style={styles.trackBg} />
      <View
        style={[
          styles.trackFill,
          { left: `${lowPct * 100}%`, right: `${(1 - highPct) * 100}%` },
        ]}
      />
      <View
        style={[styles.thumb, { left: Math.max(0, lowPct * trackWidth - THUMB_SIZE / 2) }]}
        {...lowResponder.panHandlers}
      />
      <View
        style={[styles.thumb, { left: Math.max(0, highPct * trackWidth - THUMB_SIZE / 2) }]}
        {...highResponder.panHandlers}
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
