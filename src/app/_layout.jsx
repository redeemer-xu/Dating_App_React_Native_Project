import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";
import { MatchesProvider } from "../context/MatchesContext";
import { OnboardingProvider } from "../context/OnboardingContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <ChatProvider>
            <MatchesProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="profile/me" />
                <Stack.Screen name="profile/[id]" />
                <Stack.Screen name="chat/[id]" />
                <Stack.Screen name="profile/edit" />
              </Stack>
            </MatchesProvider>
          </ChatProvider>
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
