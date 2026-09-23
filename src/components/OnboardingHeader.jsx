import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function OnboardingHeader({ step, showLogo = false, onBack }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={onBack}>
        <ArrowLeft size={18} color={colors.textOnDarkSecondary} />
      </TouchableOpacity>

      {showLogo ? (
        <View style={styles.logoWrap}>
          <Sparkles size={18} color={colors.accent} />
          <Text style={styles.logoText}>SoulSync</Text>
        </View>
      ) : null}

      <View style={styles.stepBadge}>
        <Text style={styles.stepText}>STEP {step}/3</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  logoText: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
  },
  stepBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
