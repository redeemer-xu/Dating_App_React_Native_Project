import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

/**
 * Circular avatar used across headers, sparks list, and chat.
 * - `ringed` draws the coral "new spark" ring around the avatar
 * - `online` draws a small green presence dot in the bottom-right corner
 */
export default function Avatar({ uri, size = 48, ringed = false, online = false }) {
  const dimension = ringed ? size + 6 : size;

  return (
    <View style={[styles.wrapper, { width: dimension, height: dimension }]}>
      {ringed && (
        <View
          style={[
            styles.ring,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        />
      )}
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
        transition={150}
      />
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.26,
              height: size * 0.26,
              borderRadius: (size * 0.26) / 2,
              right: ringed ? 2 : 0,
              bottom: ringed ? 2 : 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  image: {
    backgroundColor: colors.cardAlt,
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
