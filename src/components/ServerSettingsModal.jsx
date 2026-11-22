import { Server, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getApiUrl,
  hasSavedServer,
  isOnlineServer,
  normalizeServer,
  ONLINE_API_URL,
  resetServer,
  saveServer,
  testServer,
} from "../api";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";

// Pop-up to choose the server: online (Render, works anywhere)
// or a laptop running uvicorn (for testing on the same WiFi).
export default function ServerSettingsModal({ visible, onClose, onSaved }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [address, setAddress] = useState(() => getApiUrl());
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(null); // { ok: true/false, text }

  // GET / first: only save an address where our server really answers
  const handleSave = async () => {
    const url = normalizeServer(address);
    if (!url) {
      setMessage({ ok: false, text: "Type the laptop's IP, like 192.168.43.120" });
      return;
    }
    await testAndSave(url);
  };

  const testAndSave = async (url) => {
    setChecking(true);
    setMessage(
      isOnlineServer(url)
        ? { ok: true, text: "Connecting… the online server can take up to 1 minute to wake up." }
        : null,
    );
    const works = await testServer(url);
    setChecking(false);
    if (!works) {
      setMessage({
        ok: false,
        text: isOnlineServer(url)
          ? "The online server didn't answer. Check your internet and try again."
          : "No SoulSync server at " + url +
            ". Check that uvicorn is running and the phone is on the same WiFi/hotspot.",
      });
      return;
    }
    await saveServer(url);
    setAddress(url);
    setMessage({ ok: true, text: "Connected to " + url });
    onSaved?.(url);
  };

  const handleAutomatic = async () => {
    await resetServer();
    setAddress(getApiUrl());
    setMessage({ ok: true, text: "Back to automatic: " + getApiUrl() });
    onSaved?.(getApiUrl());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* inner Pressable: taps inside the card don't close it */}
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Server size={20} color={colors.accent} />
            <Text style={styles.title}>Server address</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <X size={20} color={colors.textOnDarkMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Online works anywhere with internet. To test with a laptop server instead, run
            ipconfig (Windows) or hostname -I (Linux) on the laptop and type its IP here.
          </Text>

          <TextInput
            style={styles.input}
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              setMessage(null);
            }}
            placeholder="192.168.43.120"
            placeholderTextColor={colors.textOnDarkMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {message ? (
            <Text style={[styles.message, { color: message.ok ? colors.online : colors.error }]}>
              {message.text}
            </Text>
          ) : null}

          {checking ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <Button title="Test & Save" variant="accent" onPress={handleSave} />
              {getApiUrl() !== ONLINE_API_URL ? (
                <Button
                  title="Use online server"
                  variant="secondary"
                  onPress={() => testAndSave(ONLINE_API_URL)}
                />
              ) : null}
            </>
          )}

          {hasSavedServer() ? (
            <TouchableOpacity onPress={handleAutomatic} style={styles.link}>
              <Text style={styles.linkText}>Use automatic address</Text>
            </TouchableOpacity>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      padding: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 18,
      gap: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    title: {
      flex: 1,
      color: colors.textOnDark,
      fontSize: 17,
      fontWeight: "800",
    },
    hint: {
      color: colors.textOnDarkSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.background,
      color: colors.textOnDark,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },
    message: {
      fontSize: 13,
      fontWeight: "600",
    },
    link: {
      alignItems: "center",
      paddingVertical: 4,
    },
    linkText: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: "600",
    },
  });
