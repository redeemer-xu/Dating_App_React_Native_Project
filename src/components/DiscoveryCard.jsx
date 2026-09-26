import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function DiscoveryCard({ profile, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={onPress}
      disabled={!onPress}
    >
      <Image
        source={{ uri: profile.images[0] }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['transparent', 'rgba(15,15,17,0.55)', 'rgba(15,15,17,0.95)']}
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
  card: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 80,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    color: colors.textOnDark,
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textOnDark,
  },
  age: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textOnDarkSecondary,
  },
  meta: {
    fontSize: 14,
    color: colors.textOnDarkSecondary,
    marginTop: 2,
  },
});
