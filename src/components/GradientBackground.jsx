import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export default function GradientBackground({ children }) {
  return (
    <LinearGradient
      colors={['#6B3F49', '#2A1A20', '#0D0D0F']}
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