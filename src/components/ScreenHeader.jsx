import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import Avatar from './Avatar';

export default function ScreenHeader({ avatarUri, onAvatarPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SoulSync</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onAvatarPress ?? (() => router.push(`/profile/me`))}
      >
        <Avatar uri={avatarUri} size={40} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textOnDark,
    letterSpacing: 0.2,
  },
});
