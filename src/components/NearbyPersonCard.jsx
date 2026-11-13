import { router } from "expo-router";
import { X } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { distanceLabel } from "../utils/distance";
import Avatar from "./Avatar";
import Button from "./Button";
import VerifiedBadge from "./VerifiedBadge";

// Small card about one person (tap a pin on the map, or a row on web)
export default function NearbyPersonCard({ person, onClose }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { currentUser } = useAuth();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Avatar uri={person.avatar} name={person.name} size={56} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {person.name}
              {person.age ? ", " + person.age : ""}
            </Text>
            {person.verified ? <VerifiedBadge size={18} /> : null}
          </View>
          <Text style={styles.meta}>{distanceLabel(currentUser, person)}</Text>
        </View>
        {onClose ? (
          <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <X size={20} color={colors.textOnDarkMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
      <Button
        title="View profile"
        variant="accent"
        onPress={() => router.push("/profile/" + person.id)}
      />
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 16,
      gap: 14,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    info: {
      flex: 1,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    name: {
      color: colors.textOnDark,
      fontSize: 18,
      fontWeight: "800",
    },
    meta: {
      color: colors.textOnDarkSecondary,
      fontSize: 14,
      marginTop: 2,
    },
  });
