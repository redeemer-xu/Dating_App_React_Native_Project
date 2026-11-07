import { router } from "expo-router";
import { ArrowLeft, LogOut } from "lucide-react-native";
import {
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
import { useAuth } from "../context/AuthContext";
import { useProfiles } from "../context/ProfilesContext";
import { colors } from "../theme/colors";

// isTab = opened from the bottom Profile tab (then there is no back arrow)
export default function MyProfileScreen({ isTab = false }) {
  const {
    currentUser: user,
    onboardingData: savedOnboarding,
    logout,
  } = useAuth();

  // my public profile (what others see in Discover)
  const { getProfile } = useProfiles();
  const myProfile = getProfile(user?.profileId);

  const name =
    user?.name ||
    savedOnboarding?.firstName ||
    myProfile?.name ||
    user?.username ||
    "Your Profile";
  const avatarUri = user?.avatar; // no photo = first letter of the name
  // all my photos: profile picture first, then the extra ones
  const myPhotos =
    myProfile?.images ??
    [user?.avatar, ...(user?.photos ?? [])].filter(Boolean);
  const bio =
    user?.bio || myProfile?.bio || "No bio yet. Tap Edit Profile to add one.";
  const tags =
    user?.interests ?? savedOnboarding?.interests ?? myProfile?.tags ?? [];
  const promptQuestion =
    user?.promptQuestion ?? savedOnboarding?.promptQuestion;
  const promptAnswer = user?.promptAnswer ?? savedOnboarding?.promptAnswer;
  const prompts = promptQuestion
    ? [{ question: promptQuestion, answer: promptAnswer }]
    : (myProfile?.prompts ?? []);

  // Messages and likes are NOT cleared, so the next person who logs in
  // can still receive what you sent them.
  const handleSignOut = () => {
    logout();
    router.replace("/");
  };

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
          <TouchableOpacity onPress={handleSignOut} style={styles.iconButton}>
            <LogOut size={20} color={colors.textOnDarkSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileHeader}>
            <Avatar uri={avatarUri} name={name} size={96} />
            <Text style={styles.name}>{name}</Text>
            <View style={styles.editButton}>
              <Button
                title="Edit Profile"
                variant="secondary"
                onPress={() => router.push("/profile/edit")}
              />
            </View>
          </View>

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

          {savedOnboarding?.birthday ||
          savedOnboarding?.lookingFor?.length ||
          savedOnboarding?.showMe ? (
            <View style={styles.detailsGrid}>
              {savedOnboarding?.birthday ? (
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Birthday</Text>
                  <Text style={styles.detailValue}>
                    {savedOnboarding.birthday}
                  </Text>
                </View>
              ) : null}
              {savedOnboarding?.showMe ? (
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Show me</Text>
                  <Text style={styles.detailValue}>
                    {savedOnboarding.showMe}
                  </Text>
                </View>
              ) : null}
              {savedOnboarding?.lookingFor?.length ? (
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Looking for</Text>
                  <Text style={styles.detailValue}>
                    {savedOnboarding.lookingFor.join(", ")}
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

const styles = StyleSheet.create({
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
  name: {
    color: colors.textOnDark,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 12,
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
