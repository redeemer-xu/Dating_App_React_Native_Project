import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function PillTabSwitcher({ options, activeOption, onChange }) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const isActive = option === activeOption;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.pill, isActive && styles.pillActive]}
            activeOpacity={0.85}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 999,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.accent,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnDarkMuted,
  },
  labelActive: {
    color: colors.textOnDark,
  },
});
