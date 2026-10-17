import { router } from "expo-router";
import {
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
import { newSparks, secretAdmirers } from "../data/mockData";
import { colors } from "../theme/colors";

export default function MatchesScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>New sparks</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sparkRow}
          >
            {newSparks.map((spark) => (
              <TouchableOpacity
                key={spark.id}
                onPress={() => router.push(`/chat/${spark.id}`)}
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
                onUnlockAll={() => {}}
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
