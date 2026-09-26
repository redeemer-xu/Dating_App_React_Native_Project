import { Image } from 'expo-image';
import { Heart, Lock } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';


export default function SecretAdmirerCard({ admirer, onUnlockAll }) {
  return (
    <TouchableOpacity
      activeOpacity={admirer.isUnlockAll ? 0.85 : 1}
      onPress={admirer.isUnlockAll ? onUnlockAll : undefined}
      style={styles.card}
    >
      <Image
        source={{ uri: admirer.avatar }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={18}
      />
      <View style={styles.scrim} />

      {admirer.isUnlockAll ? (
        <View style={styles.unlockContent}>
          <Lock size={22} color={colors.accent} />
          <Text style={styles.unlockText}>Unlock All</Text>
        </View>
      ) : (
        <Heart size={22} color={colors.textOnDark} fill={colors.accent} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,17,0.55)',
  },
  unlockContent: {
    alignItems: 'center',
    gap: 6,
  },
  unlockText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
});
