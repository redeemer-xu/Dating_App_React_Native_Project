import { router } from "expo-router";
import { ArrowLeft, Heart } from "lucide-react-native";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import GradientBackground from "../components/GradientBackground";
import { useMatches } from "../context/MatchesContext";
import { useProfiles } from "../context/ProfilesContext";
import { useTheme } from "../context/ThemeContext";

// "2026-11-17T19:30:00" -> "5 min ago"
function timeAgo(iso) {
  if (!iso) return "";
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes + " min ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + " h ago";
  return Math.floor(hours / 24) + " d ago";
}

// Discover -> bell: everyone who liked you that you haven't liked back yet
export default function LikesScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { likeRequests, addMatch, markLikesSeen } = useMatches();
  const { getProfile } = useProfiles();

  const people = likeRequests
    .map((r) => ({ ...r, profile: getProfile(r.fromId) }))
    .filter((r) => r.profile);

  // useEffect: opening this list = all the new likes are now "seen" (bell goes to 0)
  const unseenIds = likeRequests.filter((r) => !r.seen).map((r) => r.fromId);
  const unseenKey = unseenIds.join(",");
  useEffect(() => {
    if (unseenIds.length > 0) markLikesSeen(unseenIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unseenKey]);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={22} color={colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Likes</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {people.length === 0 ? (
            <View style={styles.empty}>
              <Heart size={36} color={colors.textOnDarkMuted} />
              <Text style={styles.emptyTitle}>No new likes yet</Text>
              <Text style={styles.emptyText}>
                When someone likes you, they show up here so you can like them back.
              </Text>
            </View>
          ) : null}

          {people.map(({ fromId, createdAt, profile }) => (
            <View key={fromId} style={styles.row}>
              <TouchableOpacity
                style={styles.person}
                onPress={() => router.push("/profile/" + fromId)}
                accessibilityLabel={"View " + profile.name + "'s profile"}
              >
                <Avatar uri={profile.avatar} name={profile.name} size={52} />
                <View style={styles.personText}>
                  <Text style={styles.name} numberOfLines={1}>
                    {profile.name}
                    {profile.age ? ", " + profile.age : ""}
                  </Text>
                  <Text style={styles.meta}>Liked you · {timeAgo(createdAt)}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => addMatch(fromId)}
                accessibilityLabel={"Like " + profile.name + " back"}
              >
                <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.likeText}>Like back</Text>
              </TouchableOpacity>
            </View>
          ))}
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
    list: {
      paddingTop: 8,
      paddingBottom: 32,
      gap: 10,
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
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 12,
    },
    person: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    },
    personText: {
      flex: 1,
      minWidth: 0,
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
    likeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.accent,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    likeText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
  });
