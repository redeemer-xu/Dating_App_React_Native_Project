import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },

  header: {
    marginBottom: 28,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textOnDark,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: colors.textOnDarkSecondary,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textOnDarkSecondary,
    marginTop: 8,
  },

  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});