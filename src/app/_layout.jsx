import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";
import { MatchesProvider } from "../context/MatchesContext";
import { OnboardingProvider } from "../context/OnboardingContext";
import { ProfilesProvider } from "../context/ProfilesContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <ProfilesProvider>
            <ChatProvider>
              <MatchesProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="profile/me" />
                  {/* "only once": tapping twice never opens the same
                      profile or chat twice (then Back works the first time) */}
                  <Stack.Screen
                    name="profile/[id]"
                    dangerouslySingular={(name, params) => params?.id}
                  />
                  <Stack.Screen
                    name="chat/[id]"
                    dangerouslySingular={(name, params) => params?.id}
                  />
                  <Stack.Screen name="profile/edit" dangerouslySingular />
                </Stack>
              </MatchesProvider>
            </ChatProvider>
          </ProfilesProvider>
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
