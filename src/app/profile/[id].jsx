import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PromptCard from '../../components/PromptCard';
import TagPill from '../../components/TagPill';
import { profiles } from '../../data/mockData';
import { colors } from '../../theme/colors';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams();
  const profile = profiles[id];

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.missingText}>Profile not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image
            source={{ uri: profile.images[0] }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(15,15,17,0.1)', 'transparent']}
            style={styles.heroTopFade}
          />
          <LinearGradient
            colors={['transparent', 'rgba(15,15,17,0.95)']}
            locations={[0.4, 1]}
            style={styles.heroBottomFade}
          >
            <Text style={styles.heroName}>
              {profile.name}
              <Text style={styles.heroAge}>, {profile.age}</Text>
            </Text>
            <Text style={styles.heroMeta}>{profile.title}</Text>
            <Text style={styles.heroMeta}>{profile.location}</Text>
          </LinearGradient>

          <SafeAreaView edges={['top']} style={styles.heroHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={22} color={colors.textOnDark} />
            </TouchableOpacity>
            <Text style={styles.heroHeaderTitle}>User Detail</Text>
            <View style={{ width: 36 }} />
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <View style={styles.card}>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vibe Check</Text>
            <View style={styles.tagWrap}>
              {profile.tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prompt Cards</Text>
            {profile.prompts.map((prompt) => (
              <PromptCard key={prompt.question} question={prompt.question} answer={prompt.answer} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  missingText: {
    color: colors.textOnDarkSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    height: 460,
    backgroundColor: colors.card,
  },
  heroTopFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 100,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textOnDark,
  },
  heroAge: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textOnDarkSecondary,
  },
  heroMeta: {
    fontSize: 14,
    color: colors.textOnDarkSecondary,
    marginTop: 2,
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15,15,17,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textOnDark,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textOnDarkSecondary,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
  },
});
