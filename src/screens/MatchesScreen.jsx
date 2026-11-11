import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import GradientBackground from "../components/GradientBackground";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useMatches } from "../context/MatchesContext";
import { useProfiles } from "../context/ProfilesContext";
import { colors } from "../theme/colors";

export default function MatchesScreen() {
  const { currentUser } = useAuth();
  const { getProfile, refreshProfiles } = useProfiles();
  const { getInbox, loadInbox, chatError } = useChat();
  const { matchIds, removeMatch, isHidden, admirerIds, refreshMatches } =
    useMatches();
  const me = currentUser?.id;

  // While this tab is open: get the newest messages, likes and profiles,
  // then check again every 5 seconds. Stops when you leave the tab.
  useFocusEffect(
    useCallback(() => {
      refreshProfiles();
      const update = () => {
        loadInbox();
        refreshMatches();
      };
      update();
      const timer = setInterval(update, 5000);
      return () => clearInterval(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [me]),
  );

  // turn the saved ids into full profiles (name, avatar...)
  const sparks = matchIds
    .map((id) => getProfile(id))
    .filter((p) => p && p.id !== me && !isHidden(p.id));

  // my conversations, newest first (also messages people sent ME)
  const inbox = getInbox()
    .map((item) => ({ ...item, profile: getProfile(item.otherId) }))
    .filter((item) => item.profile && !isHidden(item.otherId));

  // people who liked me (and I have not liked back yet), shown clearly
  const likedYou = admirerIds.map((id) => getProfile(id)).filter(Boolean);

  const confirmUnmatch = (spark) => {
    Alert.alert(
      "Unmatch with " + spark.name + "?",
      "They will be removed from your matches.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unmatch",
          style: "destructive",
          onPress: () => removeMatch(spark.id),
        },
      ],
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {chatError ? <Text style={styles.errorText}>{chatError}</Text> : null}

          <Text style={styles.sectionTitle}>New sparks</Text>
          {sparks.length > 0 ? (
            <Text style={styles.hint}>Hold a profile to unmatch</Text>
          ) : null}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sparkRow}
          >
            {sparks.length === 0 ? (
              <Text style={styles.emptyText}>
                No matches yet. Go like someone in Discover!
              </Text>
            ) : null}
            {sparks.map((spark) => (
              <TouchableOpacity
                key={spark.id}
                onPress={() => router.push("/chat/" + spark.id)}
                onLongPress={() => confirmUnmatch(spark)}
              >
                <Avatar uri={spark.avatar} name={spark.name} size={62} ringed />
                <Text style={styles.sparkName}>{spark.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Messages</Text>
          {inbox.length === 0 ? (
            <Text style={styles.emptyText}>
              No messages yet. Say hi to someone!
            </Text>
          ) : null}
          {inbox.map(({ otherId, lastMessage, profile }) => (
            <TouchableOpacity
              key={otherId}
              style={styles.inboxRow}
              onPress={() => router.push("/chat/" + otherId)}
            >
              <Avatar uri={profile.avatar} name={profile.name} size={52} />
              <View style={styles.inboxText}>
                <Text style={styles.inboxName}>{profile.name}</Text>
                <Text style={styles.inboxPreview} numberOfLines={1}>
                  {lastMessage.senderId === me ? "You: " : ""}
                  {lastMessage.text || "📷 Photo"}
                </Text>
              </View>
              <Text style={styles.inboxTime}>{lastMessage.time}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.matchesHeading}>
            <Text style={styles.sectionTitle}>Liked you</Text>
            <Text style={styles.caption}>
              {likedYou.length === 0
                ? ""
                : likedYou.length === 1
                  ? "1 person likes you"
                  : likedYou.length + " people like you"}
            </Text>
          </View>
          {likedYou.length === 0 ? (
            <Text style={styles.emptyText}>
              No one yet. Keep your profile awesome!
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sparkRow}
            >
              {likedYou.map((person) => (
                <TouchableOpacity
                  key={person.id}
                  onPress={() => router.push("/profile/" + person.id)}
                >
                  <Avatar uri={person.avatar} name={person.name} size={62} />
                  <Text style={styles.sparkName}>{person.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  title: {
    color: colors.textOnDark,
    fontSize: 20,
    fontWeight: "800",
  },
  sectionTitle: {
    color: colors.textOnDark,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  sparkRow: {
    gap: 16,
    paddingBottom: 28,
  },
  hint: {
    color: colors.textOnDarkMuted,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.textOnDarkMuted,
    fontSize: 14,
    paddingVertical: 20,
  },
  sparkName: {
    color: colors.textOnDarkSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  matchesHeading: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  caption: {
    color: colors.textOnDarkMuted,
    fontSize: 12,
  },
  inboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  inboxText: {
    flex: 1,
  },
  inboxName: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: "700",
  },
  inboxPreview: {
    color: colors.textOnDarkSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  inboxTime: {
    color: colors.textOnDarkMuted,
    fontSize: 11,
  },
});
