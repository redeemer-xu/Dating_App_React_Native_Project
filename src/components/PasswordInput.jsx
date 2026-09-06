import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fieldStyles } from './fieldStyles';

export default function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder = 'Enter password',
  error,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={fieldStyles.wrapper}>
      {label ? <Text style={fieldStyles.label}>{label}</Text> : null}
      <View style={[fieldStyles.box, styles.row, error ? fieldStyles.boxError : null]}>
        <TextInput
          style={styles.input}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textOnLight,
  },
});