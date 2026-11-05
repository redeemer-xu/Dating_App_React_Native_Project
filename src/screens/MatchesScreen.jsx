import { router } from "expo-router";
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
import SecretAdmirerCard from "../components/SecretAdmirerCard";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useMatches } from "../context/MatchesContext";
import { useProfiles } from "../context/ProfilesContext";
import { colors } from "../theme/colors";

export default function MatchesScreen() {
  const { currentUser } = useAuth();
  const { getProfile } = useProfiles();
  const { getInbox } = useChat();
  const { matchIds, removeMatch, isHidden, admirerIds } = useMatches();
  const me = currentUser?.profileId;

  // turn the saved ids into full profiles (name, avatar...)
  const sparks = matchIds
    .map((id) => getProfile(id))
    .filter((p) => p && p.id !== me && !isHidden(p.id));

  // my conversations, newest first (also messages people sent ME)
  const inbox = getInbox(me)
    .map((item) => ({ ...item, profile: getProfile(item.otherId) }))
    .filter((item) => item.profile && !isHidden(item.otherId));

  // people who liked me: show up to 3 blurred photos + the "Unlock All" box
  const admirers = admirerIds.map((id) => getProfile(id)).filter(Boolean);
  const admirerCards = admirers.slice(0, 3).map((p) => ({
    id: p.id,
    avatar: p.avatar,
    locked: true,
  }));
  if (admirers.length > 0) {
    admirerCards.push({
      id: "unlock-all",
      avatar: admirers[admirers.length - 1].avatar,
      locked: true,
      isUnlockAll: true,
    });
  }
  // empty boxes keep the 4 columns the same size
  const emptyBoxes = admirerCards.length > 0 ? 4 - admirerCards.length : 0;

  const confirmUnmatch = (spark) => {
    Alert.alert(
      `Unmatch with ${spark.name}?`,
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
                onPress={() => router.push(`/chat/${spark.id}`)}
                onLongPress={() => confirmUnmatch(spark)}
              >
                <Avatar uri={spark.avatar} size={62} ringed />
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
              onPress={() => router.push(`/chat/${otherId}`)}
            >
              <Avatar uri={profile.avatar} size={52} />
              <View style={styles.inboxText}>
                <Text style={styles.inboxName}>{profile.name}</Text>
                <Text style={styles.inboxPreview} numberOfLines={1}>
                  {lastMessage.senderId === me ? "You: " : ""}
                  {lastMessage.text}
                </Text>
              </View>
              <Text style={styles.inboxTime}>{lastMessage.time}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.matchesHeading}>
            <Text style={styles.sectionTitle}>Secret admirers</Text>
            <Text style={styles.caption}>
              {admirers.length === 0
                ? ""
                : admirers.length === 1
                  ? "1 person likes you"
                  : `${admirers.length} people like you`}
            </Text>
          </View>
          {admirers.length === 0 ? (
            <Text style={styles.emptyText}>
              No secret admirers yet. Keep your profile awesome!
            </Text>
          ) : (
            <View style={styles.admirerGrid}>
              {admirerCards.map((admirer) => (
                <SecretAdmirerCard
                  key={admirer.id}
                  admirer={admirer}
                  onUnlockAll={() =>
                    Alert.alert(
                      "SoulSync Premium",
                      "Seeing everyone who liked you is coming soon!",
                    )
                  }
                />
              ))}
              {Array.from({ length: emptyBoxes }, (_, i) => (
                <View key={`empty-${i}`} style={styles.emptyBox} />
              ))}
            </View>
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
  admirerGrid: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 24,
  },
  emptyBox: {
    flex: 1,
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
