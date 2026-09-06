import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { fieldStyles } from './fieldStyles';

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  secureTextEntry = false,
  error,
}) {
  return (
    <View style={fieldStyles.wrapper}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
      <TextInput
        style={[fieldStyles.box, styles.text, error ? fieldStyles.boxError : null]}
        placeholder={placeholder}
        placeholderTextColor={colors.textOnDarkMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: colors.textOnLight,
  },
});