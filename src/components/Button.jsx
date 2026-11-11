import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// disabled = grey and not tappable (e.g. while waiting for the server)
export default function Button({ title, onPress, variant = 'primary', glow = false, disabled = false }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const isPrimary = variant === 'primary';
  const isAccent = variant === 'accent';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primary : isAccent ? styles.accent : styles.secondary,
        glow && styles.glow,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={isPrimary ? styles.primaryText : isAccent ? styles.accentText : styles.secondaryText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabled: {
    opacity: 0.55,
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
    color: colors.textOnDark,
    fontSize: 17,
    fontWeight: '600',
  },
});