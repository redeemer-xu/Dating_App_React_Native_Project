import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function MessageBubble({ message }) {
  const isMe = message.from === 'me';

  const content = (
    <>
      {message.image && (
        <Image
          source={{ uri: message.image }}
          style={styles.image}
          contentFit="cover"
          transition={150}
        />
      )}
      {message.text && (
        <Text style={[styles.text, isMe && styles.textMe]}>{message.text}</Text>
      )}
      <View style={styles.metaRow}>
        <Text style={[styles.time, isMe && styles.timeMe]}>{message.time}</Text>
        {isMe && message.read && (
          <CheckCheck size={14} color="rgba(255,255,255,0.85)" style={{ marginLeft: 4 }} />
        )}
      </View>
    </>
  );

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      {isMe ? (
        <LinearGradient
          colors={colors.bubbleOutgoingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.bubbleMe]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.bubbleThem]}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowThem: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleThem: {
    backgroundColor: colors.bubbleIncoming,
    borderBottomLeftRadius: 6,
  },
  bubbleMe: {
    borderBottomRightRadius: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    color: colors.textOnDark,
  },
  textMe: {
    color: '#FFFFFF',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 14,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    color: colors.textOnDarkMuted,
  },
  timeMe: {
    color: 'rgba(255,255,255,0.75)',
  },
});
