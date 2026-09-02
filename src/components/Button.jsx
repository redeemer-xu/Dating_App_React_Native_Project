import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function Button({ title, onPress, variant = 'primary' }) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[styles.button, isPrimary ? styles.primary : styles.secondary]}
      onPress={onPress}
    >
      <Text style={isPrimary ? styles.primaryText : styles.secondaryText}>
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

  secondary: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },

  primaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  secondaryText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
});