import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function Button({ title, onPress, variant = 'primary', glow = false }) {
  const isPrimary = variant === 'primary';
  const isAccent = variant === 'accent';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primary : isAccent ? styles.accent : styles.secondary,
        glow && styles.glow,
      ]}
      onPress={onPress}
    >
      <Text style={isPrimary ? styles.primaryText : isAccent ? styles.accentText : styles.secondaryText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primary: {
    backgroundColor: colors.primary,
  },

  accent: {
    backgroundColor: colors.accent,
  },

  secondary: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },

  glow: {
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  accentText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  secondaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});