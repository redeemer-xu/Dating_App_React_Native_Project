import { router } from "expo-router";
import {
  Flame,
  Heart,
  MessageCircle,
  SlidersHorizontal,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActionButton from "../components/ActionButton";
import Button from "../components/Button";
import DiscoveryCard from "../components/DiscoveryCard";
import DiscoverySettingsModal from "../components/DiscoverySettingsModal";
import GradientBackground from "../components/GradientBackground";
import MatchOverlay from "../components/MatchOverlay";
import ScreenHeader from "../components/ScreenHeader";
import { useAuth } from "../context/AuthContext";
import { useMatches } from "../context/MatchesContext";
import { defaultDiscoveryFilters, discoveryProfiles } from "../data/mockData";
import { colors } from "../theme/colors";

export default function HomeScreen() {
  const { currentUser: user } = useAuth();
  const { addMatch } = useMatches();
  const [seenIds, setSeenIds] = useState([]); // people you already liked or passed
  const [filters, setFilters] = useState(defaultDiscoveryFilters);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  // 1) people who fit the filters
  const matchingFilters = discoveryProfiles.filter((p) => {
    const miles = parseInt(p.distance, 10); // "3 miles away" -> 3
    const [minAge, maxAge] = filters.ageRange;
    return p.age >= minAge && p.age <= maxAge && miles <= filters.distance;
  });
  // 2) ...and that you haven't liked or passed yet
  const visibleProfiles = matchingFilters.filter(
    (p) => !seenIds.includes(p.id),
  );
  const profile = visibleProfiles[0]; // always show the first one left

  const markSeen = (id) =>
    setSeenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  // "profile?.id" (with the ?) is important: when everyone has been seen,
  // profile is undefined, and plain "profile.id" would crash the screen.
  const handlePass = () => {
    if (profile) markSeen(profile?.id);
  };

  const handleLike = () => {
    if (!profile) return;
    addMatch(profile.id); // goes to the Matches tab
    markSeen(profile.id); // next person shows up
    setMatchedUser(profile); // pop-up "It's a Match!"
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScreenHeader avatarUri={user?.avatar} />

        <View style={styles.headingRow}>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>DISCOVER</Text>
            <Text style={styles.title}>Find your person.</Text>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.8}
            onPress={() => setSettingsVisible(true)}
          >
            <SlidersHorizontal size={18} color={colors.textOnDark} />
          </TouchableOpacity>
        </View>

        {profile ? (
          <>
            <View style={styles.cardContainer}>
              <DiscoveryCard
                profile={profile}
                onPress={() => router.push(`/profile/${profile.id}`)}
              />
            </View>

            <View style={styles.actions}>
              <ActionButton variant="pass" onPress={handlePass}>
                <X size={24} color={colors.textOnDarkSecondary} />
              </ActionButton>
              <ActionButton variant="like" size={64} onPress={handleLike}>
                <Heart
                  size={28}
                  color={colors.textOnDark}
                  fill={colors.textOnDark}
                />
              </ActionButton>
              <ActionButton
                variant="chat"
                onPress={() => router.push(`/chat/${profile.id}`)}
              >
                <MessageCircle size={23} color={colors.textOnDarkSecondary} />
              </ActionButton>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            {matchingFilters.length > 0 ? (
              <>
                <Text style={styles.emptyTitle}>
                  You&apos;ve seen everyone for now
                </Text>
                <Text style={styles.emptyText}>
                  Check your Matches, or bring back the profiles you passed.
                </Text>
                <View style={styles.startOverWrap}>
                  <Button
                    title="Start over"
                    variant="accent"
                    onPress={() => setSeenIds([])}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>
                  No one matches your filters
                </Text>
                <Text style={styles.emptyText}>
                  Try a wider age range or a bigger distance.
                </Text>
              </>
            )}
          </View>
        )}

        <View style={styles.statusRow}>
          <Flame size={15} color={colors.accent} fill={colors.accent} />
          <Text style={styles.statusText}>
            Your daily discoveries are ready
          </Text>
        </View>

        <DiscoverySettingsModal
          isVisible={isSettingsVisible}
          onClose={() => setSettingsVisible(false)}
          filters={filters}
          onApply={setFilters}
        />

        <MatchOverlay
          isVisible={!!matchedUser}
          onClose={() => setMatchedUser(null)}
          matchedUser={matchedUser}
          currentUserAvatar={user?.avatar}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: colors.textOnDark,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  startOverWrap: {
    width: 220,
    marginTop: 12,
  },
  emptyText: {
    color: colors.textOnDarkSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  heading: {
    flex: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  title: {
    color: colors.textOnDark,
    fontSize: 28,
    fontWeight: "800",
  },
  cardContainer: {
    flex: 1,
    minHeight: 360,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    paddingVertical: 18,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 8,
  },
  statusText: {
    color: colors.textOnDarkMuted,
    fontSize: 12,
  },
});
