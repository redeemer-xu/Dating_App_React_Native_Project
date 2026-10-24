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
import { useMatches } from "../context/MatchesContext";
import { discoveryProfiles, secretAdmirers } from "../data/mockData";
import { colors } from "../theme/colors";

export default function MatchesScreen() {
  const { matchIds, removeMatch } = useMatches();
  // turn the saved ids into full profiles (name, avatar...)
  const sparks = matchIds
    .map((id) => discoveryProfiles.find((p) => p.id === id))
    .filter(Boolean);

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

          <View style={styles.matchesHeading}>
            <Text style={styles.sectionTitle}>Secret admirers</Text>
            <Text style={styles.caption}>Someone likes you</Text>
          </View>
          <View style={styles.admirerGrid}>
            {secretAdmirers.map((admirer) => (
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
          </View>
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
  },
});
