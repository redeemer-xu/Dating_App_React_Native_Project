import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';

export default function OnboardingTextField({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  maxLength,
  error,
}) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textOnDarkMuted}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnDarkSecondary,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    color: colors.textOnDark,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: 6,
    color: colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
});
