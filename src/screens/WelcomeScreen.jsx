import { Redirect, router } from "expo-router";
import { Server } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import GradientBackground from "../components/GradientBackground";
import ServerSettingsModal from "../components/ServerSettingsModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function WelcomeScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  // white "SoulSync" text for dark mode, black text for light mode
  const logo = isDark
    ? require("../../assets/images/logo.png")
    : require("../../assets/images/logo-light.png");
  const { currentUser, restoring, restoreError, retryRestore, logout, server, setServer } =
    useAuth();
  const [serverOpen, setServerOpen] = useState(false); // "Server address" pop-up
  const serverText = (server ?? "").replace(/^https?:\/\//, "");

  const serverModal = (
    <ServerSettingsModal
      key={serverOpen ? "open" : "closed"} // fresh pop-up every time it opens
      visible={serverOpen}
      onClose={() => setServerOpen(false)}
      onSaved={(url) => {
        setServer(url);
        if (restoreError) {
          setServerOpen(false);
          retryRestore(); // try the saved login again with the new server
        }
      }}
    />
  );

  // Already logged in (or remembered from last time)? Skip the Welcome screen.
  if (currentUser) {
    return (
      <Redirect href={currentUser.onboarded ? "/home" : "/onboarding/step-1"} />
    );
  }

  // Still checking if someone was logged in -> logo + spinner
  if (restoring || restoreError) {
    return (
      <GradientBackground>
        <SafeAreaView style={[styles.container, styles.centered]}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          {restoreError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{restoreError}</Text>
              <Button title="Try again" onPress={retryRestore} />
              <Button
                title="Change server address"
                variant="secondary"
                onPress={() => setServerOpen(true)}
              />
              <Button
                title="Use another account"
                variant="secondary"
                onPress={logout}
              />
            </View>
          ) : (
            <ActivityIndicator size="large" color={colors.accent} />
          )}
        </SafeAreaView>
        {serverModal}
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.brand}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>Find your person, at your pace.</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Log In" onPress={() => router.push("/login")} />
          <Button
            title="Create Account"
            variant="secondary"
            onPress={() => router.push("/register")}
          />
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>

        {/* where the FastAPI server is (tap to change it, needed in the APK) */}
        <TouchableOpacity
          style={styles.serverRow}
          onPress={() => setServerOpen(true)}
          accessibilityLabel="Change server address"
        >
          <Server size={14} color={colors.textOnDarkMuted} />
          <Text style={styles.serverText}>Server: {serverText} · Change</Text>
        </TouchableOpacity>
      </SafeAreaView>
      {serverModal}
    </GradientBackground>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    serverRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 14,
      paddingVertical: 6,
    },
    serverText: {
      color: colors.textOnDarkMuted,
      fontSize: 12,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
      gap: 24,
    },
    errorBox: {
      alignSelf: "stretch",
      gap: 12,
    },
    errorText: {
      color: colors.textOnDarkSecondary,
      fontSize: 14,
      textAlign: "center",
      marginBottom: 8,
    },
    container: {
      flex: 1,
      backgroundColor: "transparent",
      paddingHorizontal: 24,
      justifyContent: "space-between",
      paddingVertical: 60,
    },

    brand: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    logo: {
      width: 220,
      height: 220,
      marginBottom: 4,
    },

    tagline: {
      fontSize: 16,
      color: colors.textOnDarkSecondary,
      textAlign: "center",
    },

    actions: {
      gap: 12,
    },

    footer: {
      fontSize: 12,
      color: colors.textOnDarkMuted,
      textAlign: "center",
      marginTop: 20,
    },
  });
