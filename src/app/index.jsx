import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import GradientBackground from '../components/GradientBackground';
import Button from '../components/Button';
import { colors } from '../theme/colors';

export default function WelcomeScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.logo}>SoulSync</Text>
          <Text style={styles.tagline}>Find your person, at your pace.</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Log In" onPress={() => router.push('/login')} />
          <Button
            title="Create Account"
            variant="secondary"
            onPress={() => router.push('/register')}
          />
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },

  brand: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textOnDark,
    marginBottom: 10,
  },

  tagline: {
    fontSize: 16,
    color: colors.textOnDarkSecondary,
    textAlign: 'center',
  },

  actions: {
    gap: 12,
  },

  footer: {
    fontSize: 12,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    marginTop: 20,
  },
});