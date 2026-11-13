import { router } from "expo-router";
import { ArrowLeft, Settings } from "lucide-react-native";
import { useState } from "react";
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
import Button from "../components/Button";
import GradientBackground from "../components/GradientBackground";
import PhotoGallery from "../components/PhotoGallery";
import PromptCard from "../components/PromptCard";
import TagPill from "../components/TagPill";
import VerificationCard from "../components/VerificationCard";
import VerifiedBadge from "../components/VerifiedBadge";
import { useAuth } from "../context/AuthContext";
import { useProfiles } from "../context/ProfilesContext";
import { useTheme } from "../context/ThemeContext";
import { takeSelfie } from "../utils/pickImage";

// isTab = opened from the bottom Profile tab (then there is no back arrow)
export default function MyProfileScreen({ isTab = false }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { currentUser: user } = useAuth();
  const { saveProfile } = useProfiles();
  const [verifying, setVerifying] = useState(false);

  // Get Verified: front-camera selfie -> uploaded -> blue check badge
  const handleVerify = async () => {
    try {
      const selfie = await takeSelfie();
      if (!selfie) return; // closed the camera
      setVerifying(true);
      await saveProfile(user.id, { verificationPhoto: selfie, verified: true });
      Alert.alert("You're verified!", "People now see a blue check on your profile.");
    } catch (err) {
      Alert.alert("Could not verify", err.message);
    } finally {
      setVerifying(false);
    }
  };

  // My profile comes from the server: the same data other people see
  const name = user?.name || user?.username || "Your Profile";
  const avatarUri = user?.avatar; // no photo = first letter of the name
  const myPhotos = user?.images ?? []; // profile picture first, then extra photos
  const bio = user?.bio || "No bio yet. Tap Edit Profile to add one.";
  const tags = user?.tags ?? [];
  const prompts = user?.prompts ?? [];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {isTab ? (
            <View style={styles.iconButton} />
          ) : (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <ArrowLeft size={22} color={colors.textOnDark} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Profile</Text>
          {/* gear = Settings (change password, theme, sign out) */}
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={styles.iconButton}
            accessibilityLabel="Settings"
          >
            <Settings size={22} color={colors.textOnDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileHeader}>
            <Avatar uri={avatarUri} name={name} size={96} />
            <View style={styles.nameRow}>
              <Text style={styles.name}>{name}</Text>
              {user?.verified ? <VerifiedBadge size={24} /> : null}
            </View>
            <View style={styles.editButton}>
              <Button
                title="Edit Profile"
                variant="secondary"
                onPress={() => router.push("/profile/edit")}
              />
            </View>
          </View>

          {user?.verified ? null : (
            <View style={styles.verifyBox}>
              <VerificationCard onPress={handleVerify} busy={verifying} />
            </View>
          )}

          {myPhotos.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                My photos ({myPhotos.length})
              </Text>
              <PhotoGallery
                images={myPhotos}
                name={name}
                style={styles.gallery}
              />
            </>
          ) : null}

          <Text style={styles.sectionTitle}>About you</Text>
          <Text style={styles.bio}>{bio}</Text>

          {user?.birthday ||
          user?.lookingFor?.length ||
          user?.showMe ? (
            <View style={styles.detailsGrid}>
              {user?.birthday ? (
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Birthday</Text>
                  <Text style={styles.detailValue}>
                    {user.birthday}
                  </Text>
                </View>
              ) : null}
              {user?.showMe ? (
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Show me</Text>
                  <Text style={styles.detailValue}>
                    {user.showMe}
                  </Text>
                </View>
              ) : null}
              {user?.lookingFor?.length ? (
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Looking for</Text>
                  <Text style={styles.detailValue}>
                    {user.lookingFor.join(", ")}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Interests</Text>
          {tags.length > 0 ? (
            <View style={styles.tags}>
              {tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No interests added yet.</Text>
          )}

          {prompts.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Prompts</Text>
              {prompts.map((prompt) => (
                <PromptCard key={prompt.question} {...prompt} />
              ))}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
  gallery: {
    height: 380,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.textOnDark,
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 18,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  name: {
    color: colors.textOnDark,
    fontSize: 26,
    fontWeight: "800",
  },
  verifyBox: {
    marginBottom: 20,
  },
  editButton: {
    alignSelf: "stretch",
    marginTop: 16,
  },
  sectionTitle: {
    color: colors.textOnDark,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  bio: {
    color: colors.textOnDarkSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  emptyText: {
    color: colors.textOnDarkSecondary,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  detailCard: {
    flexBasis: "48%",
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    padding: 12,
    minHeight: 74,
  },
  detailLabel: {
    color: colors.textOnDarkSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    color: colors.textOnDark,
    fontSize: 14,
    fontWeight: "600",
  },
});
