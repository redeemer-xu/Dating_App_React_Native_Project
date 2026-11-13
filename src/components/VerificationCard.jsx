import { Camera, ShieldCheck } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import VerifiedBadge from './VerifiedBadge';
import { useTheme } from '../context/ThemeContext';

// Get Verified: tap the camera = take a selfie with the front camera.
// verified = true -> shows "You're verified" instead. busy = uploading.
export default function VerificationCard({ onPress, verified = false, busy = false }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        {verified ? <VerifiedBadge size={24} /> : <ShieldCheck size={22} color={colors.accent} />}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{verified ? "You're verified" : 'Get Verified Now'}</Text>
        <Text style={styles.subtitle}>
          {verified
            ? 'Your selfie is saved. People see a blue check on your profile.'
            : "A quick selfie helps matches know you're really you."}
        </Text>
      </View>

      {verified ? null : (
        <TouchableOpacity
          style={styles.cameraButton}
          activeOpacity={0.85}
          onPress={onPress}
          disabled={busy}
          accessibilityLabel="Take a verification selfie"
        >
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <Camera size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      )}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
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
