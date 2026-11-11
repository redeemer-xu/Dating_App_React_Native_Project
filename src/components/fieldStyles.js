import { StyleSheet } from 'react-native';
// Shared look of the text boxes. Call makeFieldStyles(colors) inside a component.
export const makeFieldStyles = (colors) =>
  StyleSheet.create({
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
    borderColor: colors.divider,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.card,
  },

  inputText: {
    fontSize: 16,
    color: colors.textOnDark,
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