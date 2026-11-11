// The reactions you can put on a chat message (long press a message).
// The server saves the "key", the app shows the "emoji".
export const REACTIONS = [
  { key: "love", emoji: "❤️" },
  { key: "like", emoji: "👍" },
  { key: "haha", emoji: "😂" },
  { key: "wow", emoji: "😮" },
  { key: "sad", emoji: "😢" },
  { key: "angry", emoji: "😡" },
];

// "love" -> "❤️"
export function reactionEmoji(key) {
  return REACTIONS.find((r) => r.key === key)?.emoji ?? "";
}
