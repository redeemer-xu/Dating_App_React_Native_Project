import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const fieldStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnDarkSecondary,
    marginBottom: 8,
  },

  box: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.inputBackground,
  },

  boxError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },

  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 6,
  },
});