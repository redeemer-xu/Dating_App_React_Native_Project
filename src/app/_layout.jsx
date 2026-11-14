import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { ChatProvider } from "../context/ChatContext";
import { MatchesProvider } from "../context/MatchesContext";
import { OnboardingProvider } from "../context/OnboardingContext";
import { ProfilesProvider } from "../context/ProfilesContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

// The status bar (clock, battery) is white in dark mode, black in light mode
function ThemedStatusBar() {
  const { colors } = useTheme();
  return <StatusBar style={colors.statusBar} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStatusBar />
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
                    <Stack.Screen name="settings" dangerouslySingular />
                  </Stack>
                </MatchesProvider>
              </ChatProvider>
            </ProfilesProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
