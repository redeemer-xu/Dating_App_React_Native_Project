import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function GradientBackground({ children }) {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={colors.gradient}
      locations={[0, 0.45, 1]}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});