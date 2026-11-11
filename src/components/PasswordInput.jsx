import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { makeFieldStyles } from './fieldStyles';

export default function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder = 'Enter password',
  error,
}) {
  const { colors } = useTheme();
  const fieldStyles = makeFieldStyles(colors);
  const styles = makeStyles(colors);
  const [visible, setVisible] = useState(false);

  return (
    <View style={fieldStyles.wrapper}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
      <View style={[fieldStyles.box, styles.row, error ? fieldStyles.boxError : null]}>
        <TextInput
          style={[fieldStyles.inputText, styles.input]}
          placeholder={placeholder}
          placeholderTextColor={colors.textOnDarkMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
        />
        <TouchableOpacity onPress={() => setVisible((prev) => !prev)}>
          {visible ? (
            <EyeOff size={22} color={colors.textOnDarkMuted} />
          ) : (
            <Eye size={22} color={colors.textOnDarkMuted} />
          )}
        </TouchableOpacity>
      </View>
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
  },
});