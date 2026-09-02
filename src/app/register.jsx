import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import { colors } from '../theme/colors';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    Alert.alert('Account Created', `Welcome, ${username}!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started with SoulSync</Text>
      </View>

      <FormInput
        label="Username"
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <FormInput
        label="Email"
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <PasswordInput
        label="Password"
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
      />

      <PasswordInput
        label="Confirm Password"
        placeholder="Re-enter password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button title="Sign Up" onPress={handleRegister} />

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.footerText}>
          Already have an account? <Text style={styles.footerLink}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },

  header: {
    marginBottom: 28,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },

  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});