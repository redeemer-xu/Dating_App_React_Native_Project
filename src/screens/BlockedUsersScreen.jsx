import { router } from "expo-router";
import { ArrowLeft, UserX } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiGetBlocked } from "../api";
import Avatar from "../components/Avatar";
import GradientBackground from "../components/GradientBackground";
import { useAuth } from "../context/AuthContext";
import { useMatches } from "../context/MatchesContext";
import { useProfiles } from "../context/ProfilesContext";
import { useTheme } from "../context/ThemeContext";

// Settings -> Blocked users: everyone I blocked, with an Unblock button
export default function BlockedUsersScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { currentUser } = useAuth();
  const myId = currentUser?.id;
  const { getProfile } = useProfiles();
  const { unblockUser } = useMatches();
  const [blocked, setBlocked] = useState(null); // null = still loading
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null); // the one being unblocked

  // GET /users/:id/blocked -> only the people I blocked
  const loadBlocked = async () => {
    setError(null);
    try {
      const data = await apiGetBlocked(myId);
      setBlocked(data.blocked);
    } catch (err) {
      setError(err.message);
      setBlocked([]);
    }
  };

  // useEffect: load the list when the screen opens (once we know who is logged in)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (myId) loadBlocked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  const doUnblock = async (person) => {
    setBusyId(person.id);
    try {
      await unblockUser(person.id); // DELETE /blocks/:me/:id
      setBlocked((list) => list.filter((id) => id !== person.id));
    } catch (err) {
      Alert.alert("Could not unblock", err.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmUnblock = (person) => {
    Alert.alert(
      "Unblock " + person.name + "?",
      "They can see you and message you again. Your old likes and match are not restored.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Unblock", onPress: () => doUnblock(person) },
      ],
    );
  };

  // ids -> profiles (someone who deleted their account is skipped)
  const people = (blocked ?? []).map((id) => getProfile(id)).filter(Boolean);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={22} color={colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Blocked users</Text>
          <View style={styles.iconButton} />
        </View>

        {blocked === null ? (
          <ActivityIndicator style={styles.loading} color={colors.accent} />
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {people.length === 0 && !error ? (
              <View style={styles.empty}>
                <UserX size={36} color={colors.textOnDarkMuted} />
                <Text style={styles.emptyTitle}>No blocked users</Text>
                <Text style={styles.emptyText}>
                  People you block from a chat&apos;s ⋮ menu show up here.
                </Text>
              </View>
            ) : null}

            {people.map((person) => (
              <View key={person.id} style={styles.row}>
                <Avatar uri={person.avatar} name={person.name} size={48} />
                <View style={styles.rowText}>
                  <Text style={styles.name}>{person.name}</Text>
                  <Text style={styles.meta}>Blocked</Text>
                </View>
                <TouchableOpacity
                  style={styles.unblockButton}
                  onPress={() => confirmUnblock(person)}
                  disabled={busyId === person.id}
                  accessibilityLabel={"Unblock " + person.name}
                >
                  {busyId === person.id ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <Text style={styles.unblockText}>Unblock</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
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
    loading: {
      marginTop: 40,
    },
    list: {
      paddingTop: 8,
      paddingBottom: 32,
      gap: 10,
    },
    error: {
      color: colors.error,
      fontSize: 13,
    },
    empty: {
      alignItems: "center",
      gap: 8,
      marginTop: 60,
    },
    emptyTitle: {
      color: colors.textOnDark,
      fontSize: 17,
      fontWeight: "700",
    },
    emptyText: {
      color: colors.textOnDarkSecondary,
      fontSize: 14,
      textAlign: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 12,
    },
    rowText: {
      flex: 1,
    },
    name: {
      color: colors.textOnDark,
      fontSize: 16,
      fontWeight: "700",
    },
    meta: {
      color: colors.textOnDarkMuted,
      fontSize: 13,
      marginTop: 2,
    },
    unblockButton: {
      minWidth: 86,
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    unblockText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: "700",
    },
  });
