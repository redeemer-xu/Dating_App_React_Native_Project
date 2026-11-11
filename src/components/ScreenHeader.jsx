import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// The "SoulSync" title at the top. (Your profile is now the Profile tab at the bottom.)
export default function ScreenHeader() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SoulSync</Text>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textOnDark,
    letterSpacing: 0.2,
  },
});
