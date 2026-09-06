import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import GradientBackground from '../components/GradientBackground';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import { authStyles } from '../theme/authStyles';
import { isValidUsername, isValidPassword } from '../utils/validation';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleLogin = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (!isValidUsername(username)) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    Alert.alert('Login Successful', `Welcome, ${username}!`);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={authStyles.container}>
        <View style={authStyles.header}>
          <Text style={authStyles.title}>Welcome Back</Text>
          <Text style={authStyles.subtitle}>Log in to continue to SoulSync</Text>
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

        <Button title="Login" onPress={handleLogin} />

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