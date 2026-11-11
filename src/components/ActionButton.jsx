import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * variant: 'pass' | 'like' | 'chat'
 * 'like' gets a coral background with a soft glow; the others are dark
 * outlined circles so the like action stays the clear visual priority.
 */
export default function ActionButton({ variant = 'pass', size = 56, onPress, children }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const isLike = variant === 'like';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        isLike ? styles.like : styles.neutral,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  neutral: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  like: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
