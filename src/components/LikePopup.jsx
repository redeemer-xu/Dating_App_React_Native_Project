import { router } from "expo-router";
import { Heart, X } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMatches } from "../context/MatchesContext";
import { useProfiles } from "../context/ProfilesContext";
import { useTheme } from "../context/ThemeContext";
import Avatar from "./Avatar";

// The "Jastin liked you" card that slides in at the top while the app is open.
// Like back = you match. Later = it stays in the bell list (Discover, top right).
export default function LikePopup() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();
  const { likeRequests, addMatch, markLikesSeen } = useMatches();
  const { getProfile } = useProfiles();
  const [matched, setMatched] = useState(null); // the person you just liked back

  // the newest like I haven't seen yet (and whose profile we have)
  const request = likeRequests.find((r) => !r.seen && getProfile(r.fromId));
  const person = matched ?? (request ? getProfile(request.fromId) : null);
  if (!person) return null;

  const handleLikeBack = () => {
    addMatch(person.id); // POST /likes -> now you both like each other
    markLikesSeen([person.id]);
    setMatched(person);
  };

  const handleLater = () => {
    if (matched) setMatched(null);
    else markLikesSeen([person.id]);
  };

  const openChat = () => {
    setMatched(null);
    router.push("/chat/" + person.id);
  };

  return (
    <View
      style={[styles.wrap, { top: insets.top + 8 }]}
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => router.push("/profile/" + person.id)}
          accessibilityLabel={"View " + person.name + "'s profile"}
        >
          <Avatar uri={person.avatar} name={person.name} size={48} />
        </TouchableOpacity>
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1}>
            {matched
              ? "You and " + person.name + " matched!"
              : person.name + " liked you"}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {matched
              ? "Say hi and start chatting."
              : "Like back to match and chat."}
          </Text>
        </View>

        {matched ? (
          <TouchableOpacity style={styles.primary} onPress={openChat}>
            <Text style={styles.primaryText}>Chat</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primary}
            onPress={handleLikeBack}
            accessibilityLabel="Like back"
          >
            <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.primaryText}>Like back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleLater}
          hitSlop={10}
          accessibilityLabel={matched ? "Close" : "Later"}
        >
          <X size={18} color={colors.textOnDarkMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 12,
      right: 12,
      zIndex: 50,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.accent,
      padding: 12,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    text: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      color: colors.textOnDark,
      fontSize: 15,
      fontWeight: "800",
    },
    subtitle: {
      color: colors.textOnDarkSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    primary: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.accent,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    primaryText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
  });
