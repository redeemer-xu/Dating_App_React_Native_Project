import { router, useLocalSearchParams } from "expo-router";
import {
  Ban,
  ChevronLeft,
  HeartOff,
  MoreVertical,
  Send,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "../components/Avatar";
import MessageBubble from "../components/MessageBubble";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useMatches } from "../context/MatchesContext";
import { useProfiles } from "../context/ProfilesContext";
import { colors } from "../theme/colors";

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // the other person's profile id
  const { currentUser } = useAuth();
  const { getProfile } = useProfiles();
  const {
    getMessages,
    sendMessage,
    deleteMessage,
    loadConversation,
    chatError,
  } = useChat();
  const { matchIds, removeMatch, blockUser, isHidden } = useMatches();
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const me = currentUser?.id;
  const other = getProfile(id);

  // useEffect: load the messages now, then check the server every 3 seconds
  // so new messages from the other person show up by themselves
  useEffect(() => {
    if (!me || !id) return;
    loadConversation(id);
    const timer = setInterval(() => loadConversation(id), 3000);
    return () => clearInterval(timer); // stop checking when you leave the chat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, id]);

  if (!other || isHidden(id)) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.missingText}>Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  // Saved messages have a senderId. The bubble needs "me" or "them".
  const messages = getMessages(id).map((m) => ({
    ...m,
    from: m.senderId === me ? "me" : "them",
  }));
  const isMatch = matchIds.includes(id);

  // POST /messages -> saved on the server, so the other person receives it
  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    try {
      await sendMessage(id, text);
    } catch (err) {
      setDraft(text); // give the text back so it isn't lost
      Alert.alert("Message not sent", err.message);
    }
  };

  const confirmDelete = (message) => {
    if (message.from !== "me") return;

    Alert.alert("Delete message?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMessage(id, message.id),
      },
    ]);
  };

  // ---- the ⋮ menu ----
  const handleViewProfile = () => {
    setMenuOpen(false);
    router.push(`/profile/${id}`);
  };

  const handleUnmatch = () => {
    setMenuOpen(false);
    Alert.alert(
      `Unmatch with ${other.name}?`,
      "They will be removed from your matches.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unmatch",
          style: "destructive",
          onPress: () => {
            removeMatch(id);
            router.back();
          },
        },
      ],
    );
  };

  const handleBlockReport = () => {
    setMenuOpen(false);
    Alert.alert(
      `Block or report ${other.name}?`,
      "You won't see each other in Discover, Matches or Messages anymore.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          onPress: () => {
            blockUser(id);
            Alert.alert(
              "Thanks for reporting",
              "We blocked this user for you.",
            );
            router.back();
          },
        },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            blockUser(id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", `bottom`]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={26} color={colors.textOnDark} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerCenter}
          onPress={handleViewProfile}
        >
          <Avatar uri={other.avatar} name={other.name} size={36} />
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerName}>{other.name}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity hitSlop={12} onPress={() => setMenuOpen(true)}>
          <MoreVertical size={22} color={colors.textOnDarkSecondary} />
        </TouchableOpacity>
      </View>

      {/* The ⋮ menu. Tap outside it to close. */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuOpen(false)}
        >
          <SafeAreaView edges={["top"]}>
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleViewProfile}
              >
                <User size={18} color={colors.textOnDark} />
                <Text style={styles.menuText}>View profile</Text>
              </TouchableOpacity>
              {isMatch ? (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleUnmatch}
                >
                  <HeartOff size={18} color={colors.textOnDark} />
                  <Text style={styles.menuText}>Unmatch</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleBlockReport}
              >
                <Ban size={18} color={colors.error} />
                <Text style={[styles.menuText, { color: colors.error }]}>
                  Block / Report
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Pressable>
      </Modal>

      {chatError ? <Text style={styles.errorBanner}>{chatError}</Text> : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          ListHeaderComponent={
            <View style={styles.dateSeparator}>
              <Text style={styles.dateSeparatorText}>
                {isMatch
                  ? `You matched with ${other.name}`
                  : `Say hi to ${other.name}`}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No messages yet. Send the first one!
            </Text>
          }
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onLongPress={() => confirmDelete(item)}
            />
          )}
        />

        <View style={styles.composerRow}>
          <TextInput
            style={styles.composerInput}
            placeholder="Message..."
            placeholderTextColor={colors.textOnDarkMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            activeOpacity={0.85}
            onPress={handleSend}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  missingText: {
    color: colors.textOnDarkSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTextGroup: {
    justifyContent: "center",
  },
  headerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textOnDark,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  dateSeparator: {
    alignSelf: "center",
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  dateSeparatorText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textOnDarkMuted,
    letterSpacing: 0.3,
  },
  errorBanner: {
    color: "#FFFFFF",
    backgroundColor: colors.error,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  emptyText: {
    color: colors.textOnDarkMuted,
    textAlign: "center",
    fontSize: 13,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginRight: 12,
    minWidth: 190,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: "600",
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  composerInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textOnDark,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
