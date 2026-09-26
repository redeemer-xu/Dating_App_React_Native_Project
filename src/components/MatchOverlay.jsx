import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import Avatar from './Avatar';

export default function MatchOverlay({
  isVisible,
  onClose,
  matchedUser,
  currentUserAvatar,
  onSendMessage,
}) {
  if (!matchedUser) return null;

  const handleSendMessage = () => {
    if (onSendMessage) {
      onSendMessage();
    } else {
      router.push(`/chat/${matchedUser.id}`);
    }
    onClose?.();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Sparkles size={20} color={colors.accent} style={styles.sparkleTopLeft} />
          <Sparkles size={16} color={colors.accent} style={styles.sparkleBottomRight} />

          <View style={styles.tag}>
            <Text style={styles.tagText}>INSTANT SPARK</Text>
          </View>

          <Text style={styles.title}>It's a Match!</Text>

          <View style={styles.avatarRow}>
            <View style={[styles.avatarWrap, styles.avatarLeft]}>
              <Avatar uri={currentUserAvatar} size={96} ringed />
            </View>
            <View style={[styles.avatarWrap, styles.avatarRight]}>
              <Avatar uri={matchedUser.avatar} size={96} ringed />
            </View>
          </View>

          <Text style={styles.subtext}>
            You and <Text style={styles.subtextEmphasis}>{matchedUser.name}</Text> liked each other.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleSendMessage}
          >
            <Text style={styles.primaryButtonText}>Send a Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 12, 19, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(18, 18, 26, 0.96)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 28,
    paddingVertical: 30,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  sparkleTopLeft: {
    position: 'absolute',
    top: 22,
    left: 26,
    opacity: 0.8,
  },
  sparkleBottomRight: {
    position: 'absolute',
    bottom: 24,
    right: 30,
    opacity: 0.55,
  },
  tag: {
    backgroundColor: 'rgba(255, 113, 144, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 6,
    marginBottom: 12,
  },
  tagText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.accent,
    marginBottom: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(255,107,129,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  avatarRow: {
    width: 188,
    height: 106,
    marginBottom: 20,
  },
  avatarWrap: {
    position: 'absolute',
    top: 0,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: 'rgba(7, 7, 12, 0.8)',
  },
  avatarLeft: {
    left: 0,
  },
  avatarRight: {
    left: 92,
  },
  subtext: {
    fontSize: 15,
    color: colors.textOnDarkSecondary,
    marginBottom: 26,
    textAlign: 'center',
    lineHeight: 22,
  },
  subtextEmphasis: {
    color: colors.textOnDark,
    fontWeight: '700',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  secondaryButtonText: {
    color: colors.textOnDarkSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
