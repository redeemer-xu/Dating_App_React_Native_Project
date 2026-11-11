import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function TagPill({ label }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return <Text style={styles.pill}>{label}</Text>;
}

const makeStyles = (colors) =>
  StyleSheet.create({
  pill: {
    backgroundColor: colors.accentSoft,
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    overflow: 'hidden',
  },
});
