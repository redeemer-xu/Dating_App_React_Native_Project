import { Camera, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function VerificationCard({ onPress }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <ShieldCheck size={22} color={colors.accent} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Get Verified Now</Text>
        <Text style={styles.subtitle}>
          A quick selfie helps matches know you're really you.
        </Text>
      </View>

      <TouchableOpacity style={styles.cameraButton} activeOpacity={0.85} onPress={onPress}>
        <Camera size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.cardAlt,
    borderRadius: 18,
    padding: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textOnDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textOnDarkSecondary,
    lineHeight: 18,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
