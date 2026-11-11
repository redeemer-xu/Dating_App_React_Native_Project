import { Trash2 } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { REACTIONS } from "../data/reactions";
import { useTheme } from "../context/ThemeContext";

// Shows after you long press a message (like Facebook Messenger):
// a bar of reactions, and "Delete" if it is your own message.
export default function ReactionPicker({ message, myReaction, canDelete, onPick, onDelete, onClose }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Modal visible={!!message} transparent animationType="fade" onRequestClose={onClose}>
      {/* tap anywhere outside to close */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.bar}>
          {REACTIONS.map((r) => (
            <TouchableOpacity
              key={r.key}
              onPress={() => onPick(r.key)}
              style={[styles.emojiButton, myReaction === r.key && styles.emojiChosen]}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{r.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {myReaction ? (
          <Text style={styles.hint}>Tap your reaction again to remove it</Text>
        ) : null}

        {canDelete ? (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete} activeOpacity={0.8}>
            <Trash2 size={18} color={colors.error} />
            <Text style={styles.deleteText}>Delete message</Text>
          </TouchableOpacity>
        ) : null}
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 20,
  },
  bar: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  emojiButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiChosen: {
    backgroundColor: colors.divider,
  },
  emoji: {
    fontSize: 28,
  },
  hint: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  deleteText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: "600",
  },
});
