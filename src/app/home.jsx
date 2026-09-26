import { router } from 'expo-router';
import { Flame, Heart, MessageCircle, SlidersHorizontal, X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButton from '../components/ActionButton';
import DiscoveryCard from '../components/DiscoveryCard';
import DiscoverySettingsModal from '../components/DiscoverySettingsModal';
import GradientBackground from '../components/GradientBackground';
import MatchOverlay from '../components/MatchOverlay';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import {
  currentUser,
  defaultDiscoveryFilters,
  discoveryProfiles,
} from '../data/mockData';
import { colors } from '../theme/colors';

export default function HomeScreen() {
  const { currentUser: user } = useAuth();
  const [profileIndex, setProfileIndex] = useState(0);
  const [filters, setFilters] = useState(defaultDiscoveryFilters);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const profile = discoveryProfiles[profileIndex];

  const showNextProfile = () => {
    setProfileIndex((currentIndex) => (currentIndex + 1) % discoveryProfiles.length);
  };

  const handleLike = () => {
    setMatchedUser(profile);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScreenHeader avatarUri={user?.photoURL ?? undefined} />

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

        <View style={styles.cardContainer}>
          <DiscoveryCard profile={profile} onPress={() => router.push(`/profile/${profile.id}`)} />
        </View>

        <View style={styles.actions}>
          <ActionButton variant="pass" onPress={showNextProfile}>
            <X size={24} color={colors.textOnDarkSecondary} />
          </ActionButton>
          <ActionButton variant="like" size={64} onPress={handleLike}>
            <Heart size={28} color={colors.textOnDark} fill={colors.textOnDark} />
          </ActionButton>
          <ActionButton variant="chat" onPress={() => router.push('/chat/maya')}>
            <MessageCircle size={23} color={colors.textOnDarkSecondary} />
          </ActionButton>
        </View>

        <View style={styles.statusRow}>
          <Flame size={15} color={colors.accent} fill={colors.accent} />
          <Text style={styles.statusText}>Your daily discoveries are ready</Text>
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
          currentUserAvatar={currentUser.avatar}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  title: {
    color: colors.textOnDark,
    fontSize: 28,
    fontWeight: '800',
  },
  cardContainer: {
    flex: 1,
    minHeight: 360,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingVertical: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  statusText: {
    color: colors.textOnDarkMuted,
    fontSize: 12,
  },
});
