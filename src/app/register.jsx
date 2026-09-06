import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import GradientBackground from '../components/GradientBackground';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import { authStyles } from '../theme/authStyles';
import {
  isValidUsername,
  isValidEmail,
  isValidPassword,
} from '../utils/validation';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleRegister = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (!isValidUsername(username)) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    Alert.alert('Account Created', `Welcome, ${username}!`);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={authStyles.container}>
        <View style={authStyles.header}>
          <Text style={authStyles.title}>Create Account</Text>
          <Text style={authStyles.subtitle}>
            Sign up to get started with SoulSync
          </Text>
        </View>

        <FormInput
          label="Username"
          placeholder="Enter username"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            clearError('username');
          }}
          autoCapitalize="none"
          error={errors.username}
        />

        <FormInput
          label="Email"
          placeholder="Enter email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearError('email');
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearError('password');
          }}
          error={errors.password}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            clearError('confirmPassword');
          }}
          error={errors.confirmPassword}
        />

        <Button title="Sign Up" onPress={handleRegister} />

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={authStyles.footerText}>
            Already have an account?{' '}
            <Text style={authStyles.footerLink}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GradientBackground>
  );
}