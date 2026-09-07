import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import GradientBackground from '../components/GradientBackground';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import { authStyles } from '../theme/authStyles';
import { isValidEmail, isValidPassword } from '../utils/validation';

function getFirebaseErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is invalid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleLogin = async () => {
    const newErrors = {};

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

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert('Login Successful', 'Welcome back!');
    } catch (err) {
      Alert.alert('Login Failed', getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={authStyles.container}>
        <View style={authStyles.header}>
          <Text style={authStyles.title}>Welcome Back</Text>
          <Text style={authStyles.subtitle}>Log in to continue to SoulSync</Text>
        </View>

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

        <Button
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
        />

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={authStyles.footerText}>
            Don't have an account?{' '}
            <Text style={authStyles.footerLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GradientBackground>
  );
}