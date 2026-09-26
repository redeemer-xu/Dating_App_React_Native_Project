import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function TagPill({ label }) {
  return <Text style={styles.pill}>{label}</Text>;
}

const styles = StyleSheet.create({
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
