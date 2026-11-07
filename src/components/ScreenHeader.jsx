import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

// The "SoulSync" title at the top. (Your profile is now the Profile tab at the bottom.)
export default function ScreenHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SoulSync</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textOnDark,
    letterSpacing: 0.2,
  },
});
