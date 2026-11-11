import { router, useFocusEffect } from "expo-router";
import { Flame, Search, SlidersHorizontal, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import DiscoverySettingsModal from "../components/DiscoverySettingsModal";
import GradientBackground from "../components/GradientBackground";
import MatchOverlay from "../components/MatchOverlay";
import ScreenHeader from "../components/ScreenHeader";
import SwipeDeck from "../components/SwipeDeck";
import { useAuth } from "../context/AuthContext";
import { useMatches } from "../context/MatchesContext";
import { useProfiles } from "../context/ProfilesContext";
import { defaultDiscoveryFilters } from "../data/mockData";
import { colors } from "../theme/colors";

export default function HomeScreen() {
  const { currentUser: user } = useAuth();
  const { addMatch, isHidden, matchIds, refreshMatches } = useMatches();
  const { profiles, loading, error, refreshProfiles } = useProfiles();

  // Every time you open Discover: get the newest profiles from the server
  // (so people who just signed up show up)
  useFocusEffect(
    useCallback(() => {
      refreshProfiles();
      refreshMatches();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  const [seenIds, setSeenIds] = useState([]); // people you already liked or passed
  const [filters, setFilters] = useState(defaultDiscoveryFilters);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [search, setSearch] = useState("");

  // ---- search bar: find people by name or interest (e.g. "coffee") ----
  const query = search.trim().toLowerCase();
  const searchResults = profiles.filter((p) => {
    if (!query) return false;
    if (p.id === user?.id || isHidden(p.id)) return false;
    const name = (p.name ?? "").toLowerCase();
    const tags = (p.tags ?? []).map((tag) => tag.toLowerCase());
    return name.includes(query) || tags.some((tag) => tag.includes(query));
  });
  // 1) people who fit the filters
  const matchingFilters = profiles.filter((p) => {
    if (p.id === user?.id) return false; // never show yourself
    if (isHidden(p.id)) return false; // blocked
    const miles = parseInt(p.distance, 10); // "3 miles away" -> 3
    const [minAge, maxAge] = filters.ageRange;
    return p.age >= minAge && p.age <= maxAge && miles <= filters.distance;
  });
  // 2) ...and that you haven't liked or passed yet
  // (liked people stay hidden even after you log out and back in)
  const visibleProfiles = matchingFilters.filter(
    (p) => !seenIds.includes(p.id) && !matchIds.includes(p.id),
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
        <ScreenHeader />

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

        <View style={styles.searchBox}>
          <Search size={18} color={colors.textOnDarkMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or interest"
            placeholderTextColor={colors.textOnDarkMuted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={10}>
              <X size={18} color={colors.textOnDarkMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {query ? (
          // typing in the search bar = show the results instead of the cards
          <ScrollView
            style={styles.results}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.resultsContent}
          >
            {searchResults.length === 0 ? (
              <Text style={styles.noResults}>
                No one found for &quot;{search.trim()}&quot;
              </Text>
            ) : null}
            {searchResults.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.resultRow}
                activeOpacity={0.8}
                onPress={() => router.push("/profile/" + p.id)}
              >
                <Avatar uri={p.avatar} name={p.name} size={50} />
                <View style={styles.resultText}>
                  <Text style={styles.resultName}>
                    {p.name}
                    {p.age ? ", " + p.age : ""}
                  </Text>
                  <Text style={styles.resultTags} numberOfLines={1}>
                    {(p.tags ?? []).join(" · ") || p.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : error && profiles.length === 0 ? (
          // the server could not be reached
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Can&apos;t load profiles</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <View style={styles.startOverWrap}>
              <Button
                title="Try again"
                variant="accent"
                onPress={refreshProfiles}
              />
            </View>
          </View>
        ) : loading && profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading profiles...</Text>
          </View>
        ) : profile ? (
          // key = a fresh card for every profile
          <SwipeDeck
            key={profile.id}
            profile={profile}
            onPass={handlePass}
            onLike={handleLike}
            onOpenProfile={() => router.push("/profile/" + profile.id)}
          />
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

        {query ? null : (
          <View style={styles.statusRow}>
            <Flame size={15} color={colors.accent} fill={colors.accent} />
            <Text style={styles.statusText}>
              Your daily discoveries are ready
            </Text>
          </View>
        )}

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
          currentUserName={user?.name || user?.username}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: colors.textOnDark,
    fontSize: 15,
    paddingVertical: 0,
  },
  results: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 20,
  },
  noResults: {
    color: colors.textOnDarkSecondary,
    fontSize: 15,
    textAlign: "center",
    marginTop: 30,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: "700",
  },
  resultTags: {
    color: colors.textOnDarkSecondary,
    fontSize: 13,
    marginTop: 2,
  },
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
