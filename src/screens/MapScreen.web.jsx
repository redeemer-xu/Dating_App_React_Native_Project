import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import NearbyPersonCard from "../components/NearbyPersonCard";
import { useAuth } from "../context/AuthContext";
import { useMatches } from "../context/MatchesContext";
import { useProfiles } from "../context/ProfilesContext";
import { useTheme } from "../context/ThemeContext";
import { distanceLabel, kmBetween } from "../utils/distance";

// Web version of the Map tab: react-native-maps only works on phones,
// so the browser shows the same people as a list, nearest first.
export default function MapScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { currentUser } = useAuth();
  const { profiles, refreshProfiles } = useProfiles();
  const { isHidden } = useMatches();
  const [selected, setSelected] = useState(null);

  useFocusEffect(
    useCallback(() => {
      refreshProfiles();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const people = profiles
    .filter((p) => p.id !== currentUser?.id && !isHidden(p.id) && p.latitude != null)
    .sort((a, b) => (kmBetween(currentUser, a) ?? 0) - (kmBetween(currentUser, b) ?? 0));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>People near you</Text>
      <Text style={styles.subtitle}>
        The map shows on the phone app. On the web, here is the list (nearest first).
      </Text>
      <ScrollView contentContainerStyle={styles.list}>
        {people.map((p) => (
          <TouchableOpacity key={p.id} style={styles.row} onPress={() => setSelected(p)}>
            <Avatar uri={p.avatar} name={p.name} size={44} />
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.distance}>{distanceLabel(currentUser, p)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selected ? (
        <View style={styles.bottom}>
          <NearbyPersonCard person={selected} onClose={() => setSelected(null)} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    title: {
      color: colors.textOnDark,
      fontSize: 24,
      fontWeight: "800",
      marginTop: 16,
    },
    subtitle: {
      color: colors.textOnDarkSecondary,
      fontSize: 13,
      marginTop: 4,
      marginBottom: 12,
    },
    list: {
      paddingBottom: 200,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    name: {
      flex: 1,
      color: colors.textOnDark,
      fontSize: 16,
      fontWeight: "700",
    },
    distance: {
      color: colors.textOnDarkSecondary,
      fontSize: 13,
    },
    bottom: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
    },
  });
