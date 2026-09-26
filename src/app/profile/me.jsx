import { router } from 'expo-router';
import { ArrowLeft, LogOut } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/Avatar';
import GradientBackground from '../../components/GradientBackground';
import PromptCard from '../../components/PromptCard';
import TagPill from '../../components/TagPill';
import { useAuth } from '../../context/AuthContext';
import { discoveryProfiles } from '../../data/mockData';
import { colors } from '../../theme/colors';

export default function MyProfileScreen() {
  const { currentUser: user, onboardingData: savedOnboarding, logout } = useAuth();
  const fallbackProfile = discoveryProfiles[0];

  const profile = savedOnboarding ?? fallbackProfile;
  const name = savedOnboarding?.firstName || user?.username || 'Your Profile';
  const avatarUri = user?.photoURL || 'https://i.pravatar.cc/300?img=32';
  const bio = savedOnboarding?.promptAnswer || profile.bio;
  const tags = savedOnboarding?.interests?.length ? savedOnboarding.interests : profile.tags;
  const prompts = savedOnboarding?.promptQuestion
    ? [
        {
          question: savedOnboarding.promptQuestion,
          answer: savedOnboarding.promptAnswer,
        },
      ]
    : profile.prompts;

  const metaDetails = [
    savedOnboarding?.birthday,
    savedOnboarding?.showMe,
    savedOnboarding?.lookingFor?.length ? `Looking for ${savedOnboarding.lookingFor.join(', ')}` : null,
  ].filter(Boolean);

  const handleSignOut = () => {
    logout();
    router.replace('/');
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={22} color={colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.iconButton}>
            <LogOut size={20} color={colors.textOnDarkSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <Avatar uri={avatarUri} size={96} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {savedOnboarding ? metaDetails.join(' • ') : profile.title}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>About you</Text>
        <Text style={styles.bio}>{bio}</Text>

        {savedOnboarding?.birthday || savedOnboarding?.lookingFor?.length || savedOnboarding?.showMe ? (
          <View style={styles.detailsGrid}>
            {savedOnboarding?.birthday ? (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Birthday</Text>
                <Text style={styles.detailValue}>{savedOnboarding.birthday}</Text>
              </View>
            ) : null}
            {savedOnboarding?.showMe ? (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Show me</Text>
                <Text style={styles.detailValue}>{savedOnboarding.showMe}</Text>
              </View>
            ) : null}
            {savedOnboarding?.lookingFor?.length ? (
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Looking for</Text>
                <Text style={styles.detailValue}>{savedOnboarding.lookingFor.join(', ')}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.tags}>
          {tags.map((tag) => <TagPill key={tag} label={tag} />)}
        </View>

        {prompts.map((prompt) => (
          <PromptCard key={prompt.question} {...prompt} />
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textOnDark,
    fontSize: 18,
    fontWeight: '700',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  name: {
    color: colors.textOnDark,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 12,
  },
  meta: {
    color: colors.textOnDarkSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.textOnDark,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  bio: {
    color: colors.textOnDarkSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  detailCard: {
    flexBasis: '48%',
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    padding: 12,
    minHeight: 74,
  },
  detailLabel: {
    color: colors.textOnDarkSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: colors.textOnDark,
    fontSize: 14,
    fontWeight: '600',
  },
});