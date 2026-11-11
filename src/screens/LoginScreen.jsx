import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import GradientBackground from "../components/GradientBackground";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { makeAuthStyles } from "../theme/authStyles";
import { isValidEmail, isValidPassword } from "../utils/validation";

export default function LoginScreen() {
  const { colors } = useTheme();
  const authStyles = makeAuthStyles(colors);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // waiting for the server
  const { login } = useAuth();

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleLogin = async () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!isValidPassword(password)) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // POST /login to our FastAPI server
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      // not finished onboarding yet? continue there
      router.replace(user.onboarded ? "/home" : "/onboarding/step-1");
    } catch (err) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={authStyles.container}>
        <View style={authStyles.header}>
          <Text style={authStyles.title}>Welcome Back</Text>
          <Text style={authStyles.subtitle}>
            Log in to continue to SoulSync
          </Text>
        </View>

        <FormInput
          label="Email"
          placeholder="Enter email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearError("email");
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
            clearError("password");
          }}
          error={errors.password}
        />

        <Button
          title={loading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          disabled={loading}
        />

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={authStyles.footerText}>
            {"Don't have an account? "}
            <Text style={authStyles.footerLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GradientBackground>
  );
}
