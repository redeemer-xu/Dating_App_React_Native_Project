import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { reactionEmoji } from "../data/reactions";
import { colors } from "../theme/colors";

// One chat message: text and/or a photo, plus its reactions underneath.
// Long press = open the reaction bar. Tap the photo = see it big.
export default function MessageBubble({ message, onLongPress, onPressImage }) {
  const isMe = message.from === "me";
  const hasText = !!message.text;

  // reactions = { "1": "love", "2": "haha" } -> show each emoji once + a count
  const reactionKeys = Object.values(message.reactions ?? {});
  const emojis = [...new Set(reactionKeys)].map(reactionEmoji).join("");

  const content = (
    <>
      {message.image ? (
        <Pressable onPress={onPressImage} onLongPress={onLongPress}>
          <Image
            source={{ uri: message.image }}
            style={[styles.image, !hasText && styles.imageOnly]}
            contentFit="cover"
            transition={150}
          />
        </Pressable>
      ) : null}
      {hasText ? (
        <Text style={[styles.text, isMe && styles.textMe]}>{message.text}</Text>
      ) : null}
      <Text style={[styles.time, isMe && styles.timeMe]}>{message.time}</Text>
    </>
  );

  const bubbleStyle = [styles.bubble, !hasText && styles.bubblePhoto];

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={300}
        style={styles.column}
      >
        {isMe ? (
          <LinearGradient
            colors={colors.bubbleOutgoingGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[bubbleStyle, styles.bubbleMe]}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={[bubbleStyle, styles.bubbleThem]}>{content}</View>
        )}

        {reactionKeys.length > 0 ? (
          <View
            style={[
              styles.reactionPill,
              isMe ? styles.pillMe : styles.pillThem,
            ]}
          >
            <Text style={styles.reactionEmoji}>{emojis}</Text>
            {reactionKeys.length > 1 ? (
              <Text style={styles.reactionCount}>{reactionKeys.length}</Text>
            ) : null}
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 14,
    flexDirection: "row",
  },
  rowMe: {
    justifyContent: "flex-end",
  },
  rowThem: {
    justifyContent: "flex-start",
  },
  column: {
    maxWidth: "78%",
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubblePhoto: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 6,
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
    color: "#FFFFFF",
  },
  image: {
    width: 220,
    height: 260,
    borderRadius: 16,
    marginBottom: 8,
  },
  imageOnly: {
    marginBottom: 4,
  },
  time: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginRight: 6,
    fontSize: 11,
    color: colors.textOnDarkMuted,
  },
  timeMe: {
    color: "rgba(255,255,255,0.75)",
  },
  reactionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: -8, // sits on the bottom edge of the bubble
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.background,
  },
  pillMe: {
    alignSelf: "flex-end",
    marginRight: 8,
  },
  pillThem: {
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textOnDarkSecondary,
  },
});
