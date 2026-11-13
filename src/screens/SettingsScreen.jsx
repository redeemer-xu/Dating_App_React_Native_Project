import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Lock,
  LogOut,
  Mail,
  Moon,
  Smartphone,
  Sun,
  Trash2,
  User,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiChangePassword, apiDeleteAccount } from "../api";
import Button from "../components/Button";
import GradientBackground from "../components/GradientBackground";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// The 3 theme choices
const THEMES = [
  { key: "dark", label: "Dark", Icon: Moon },
  { key: "light", label: "Light", Icon: Sun },
  { key: "system", label: "System", Icon: Smartphone },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const styles = makeStyles(colors);
  const { currentUser, logout } = useAuth();

  // ---- change password form ----
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const closePasswordForm = () => {
    setPasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  // POST /users/:id/password -> the server checks the current password first
  const handleChangePassword = async () => {
    const newErrors = {};
    if (!currentPassword) newErrors.current = "Type your current password.";
    if (newPassword.length < 6) newErrors.next = "At least 6 characters.";
    if (confirmPassword !== newPassword) newErrors.confirm = "Passwords do not match.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      await apiChangePassword(currentUser.id, currentPassword, newPassword);
      closePasswordForm();
      Alert.alert("Password changed", "Use your new password the next time you log in.");
    } catch (err) {
      if (err.message.toLowerCase().includes("current password")) {
        setErrors({ current: err.message });
      } else {
        setErrors({ save: err.message });
      }
    } finally {
      setSaving(false);
    }
  };

  // ---- delete account (needs the password) ----
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      setDeleteError("Type your password to confirm.");
      return;
    }
    Alert.alert(
      "Delete your account?",
      "Your profile, likes, messages and photos will be deleted forever. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete forever",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            setDeleteError(null);
            try {
              await apiDeleteAccount(currentUser.id, deletePassword);
              logout(); // also forgets the saved login
              router.replace("/");
            } catch (err) {
              setDeleteError(err.message);
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  // ---- sign out (likes and messages stay saved on the server) ----
  const handleSignOut = () => {
    Alert.alert("Sign out?", "You can log in again anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={22} color={colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ---------------- ACCOUNT ---------------- */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <User size={20} color={colors.accent} />
              <Text style={styles.rowTitle}>Username</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {currentUser?.username}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Mail size={20} color={colors.accent} />
              <Text style={styles.rowTitle}>Email</Text>
              <Text style={styles.rowValue} numberOfLines={1}>
                {currentUser?.email}
              </Text>
            </View>
          </View>

          {/* ---------------- SECURITY ---------------- */}
          <Text style={styles.sectionLabel}>SECURITY</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => (passwordOpen ? closePasswordForm() : setPasswordOpen(true))}
            >
              <Lock size={20} color={colors.accent} />
              <Text style={styles.rowTitle}>Change password</Text>
              {passwordOpen ? (
                <ChevronDown size={20} color={colors.textOnDarkMuted} />
              ) : (
                <ChevronRight size={20} color={colors.textOnDarkMuted} />
              )}
            </TouchableOpacity>

            {passwordOpen ? (
              <View style={styles.passwordForm}>
                <PasswordInput
                  label="Current password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  error={errors.current}
                />
                <PasswordInput
                  label="New password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  error={errors.next}
                />
                <PasswordInput
                  label="Confirm new password"
                  placeholder="Type it again"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={errors.confirm}
                />
                {errors.save ? <Text style={styles.errorText}>{errors.save}</Text> : null}
                <Button
                  title={saving ? "Saving..." : "Save new password"}
                  variant="accent"
                  onPress={handleChangePassword}
                  disabled={saving}
                />
              </View>
            ) : null}
          </View>

          {/* ---------------- APPEARANCE ---------------- */}
          <Text style={styles.sectionLabel}>APPEARANCE</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Theme</Text>
            <View style={styles.themeRow}>
              {THEMES.map(({ key, label, Icon }) => {
                const chosen = mode === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.themeOption, chosen && styles.themeChosen]}
                    activeOpacity={0.8}
                    onPress={() => setMode(key)}
                  >
                    <Icon size={20} color={chosen ? "#FFFFFF" : colors.textOnDarkSecondary} />
                    <Text style={[styles.themeText, chosen && styles.themeTextChosen]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.caption}>
              System follows your phone&apos;s dark or light setting.
            </Text>
          </View>

          {/* ---------------- SIGN OUT ---------------- */}
          <TouchableOpacity style={[styles.card, styles.row, styles.signOut]} onPress={handleSignOut}>
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.rowTitle, { color: colors.error }]}>Sign out</Text>
          </TouchableOpacity>

          {/* ---------------- DANGER ZONE ---------------- */}
          <Text style={styles.sectionLabel}>DANGER ZONE</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => {
                setDeleteOpen(!deleteOpen);
                setDeletePassword("");
                setDeleteError(null);
              }}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.rowTitle, { color: colors.error }]}>Delete account</Text>
              {deleteOpen ? (
                <ChevronDown size={20} color={colors.textOnDarkMuted} />
              ) : (
                <ChevronRight size={20} color={colors.textOnDarkMuted} />
              )}
            </TouchableOpacity>

            {deleteOpen ? (
              <View style={styles.passwordForm}>
                <Text style={styles.caption}>
                  This deletes your profile, likes, messages and photos forever.
                </Text>
                <View style={styles.deleteField}>
                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChangeText={setDeletePassword}
                    error={deleteError}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.deleteButton, deleting && styles.deleteButtonBusy]}
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.deleteButtonText}>
                    {deleting ? "Deleting..." : "Delete my account"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <Text style={styles.version}>SoulSync v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
    },
    iconButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: colors.textOnDark,
      fontSize: 18,
      fontWeight: "700",
    },
    scrollContent: {
      paddingBottom: 32,
    },
    sectionLabel: {
      color: colors.textOnDarkMuted,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.2,
      marginTop: 18,
      marginBottom: 8,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 14,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 4,
    },
    rowTitle: {
      flex: 1,
      color: colors.textOnDark,
      fontSize: 15,
      fontWeight: "600",
    },
    rowValue: {
      maxWidth: "55%",
      color: colors.textOnDarkSecondary,
      fontSize: 14,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      marginVertical: 10,
    },
    passwordForm: {
      marginTop: 16,
    },
    errorText: {
      color: colors.error,
      fontSize: 13,
      marginBottom: 12,
    },
    cardTitle: {
      color: colors.textOnDark,
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 12,
    },
    themeRow: {
      flexDirection: "row",
      gap: 8,
    },
    themeOption: {
      flex: 1,
      alignItems: "center",
      gap: 6,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.background,
    },
    themeChosen: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    themeText: {
      color: colors.textOnDarkSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    themeTextChosen: {
      color: "#FFFFFF",
    },
    caption: {
      color: colors.textOnDarkMuted,
      fontSize: 12,
      marginTop: 10,
    },
    deleteField: {
      marginTop: 12,
    },
    deleteButton: {
      backgroundColor: colors.error,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    deleteButtonBusy: {
      opacity: 0.6,
    },
    deleteButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
    signOut: {
      marginTop: 24,
    },
    version: {
      color: colors.textOnDarkMuted,
      fontSize: 12,
      textAlign: "center",
      marginTop: 24,
    },
  });
