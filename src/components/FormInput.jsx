import { Text, TextInput, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { makeFieldStyles } from "./fieldStyles";

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = "sentences",
  keyboardType = "default",
  secureTextEntry = false,
  maxLength,
  error,
}) {
  const { colors } = useTheme();
  const fieldStyles = makeFieldStyles(colors);
  return (
    <View style={fieldStyles.wrapper}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
      <TextInput
        style={[
          fieldStyles.box,
          fieldStyles.inputText,
          error ? fieldStyles.boxError : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textOnDarkMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
      />
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}
