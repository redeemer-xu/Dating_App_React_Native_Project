import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MoreVertical, Send } from 'lucide-react-native';
import { useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Avatar from '../../components/Avatar';
import MessageBubble from '../../components/MessageBubble';
import { chatThreads, newSparks, profiles } from '../../data/mockData';
import { colors } from '../../theme/colors';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const fallbackProfile = profiles[id] ?? newSparks.find((spark) => spark.id === id);
  const thread =
    chatThreads[id] ??
    (fallbackProfile
      ? {
          id: fallbackProfile.id,
          name: fallbackProfile.name,
          avatar: fallbackProfile.avatar ?? fallbackProfile.images?.[0],
          online: true,
          matchedOn: 'TODAY',
          messages: [],
        }
      : null);
  const [messages, setMessages] = useState(thread?.messages ?? []);
  const [draft, setDraft] = useState('');

  if (!thread) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.missingText}>Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        from: 'me',
        text: draft.trim(),
        time: 'Now',
        read: false,
      },
    ]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={26} color={colors.textOnDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Avatar uri={thread.avatar} size={36} online={thread.online} />
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerName}>{thread.name}</Text>
            {thread.online && (
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineLabel}>ONLINE NOW</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity hitSlop={12}>
          <MoreVertical size={22} color={colors.textOnDarkSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          ListHeaderComponent={
            <View style={styles.dateSeparator}>
              <Text style={styles.dateSeparatorText}>
                {thread.matchedOn} · You matched with {thread.name}
              </Text>
            </View>
          }
          renderItem={({ item }) => <MessageBubble message={item} />}
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
          <TouchableOpacity style={styles.sendButton} activeOpacity={0.85} onPress={handleSend}>
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
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTextGroup: {
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.online,
  },
  onlineLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: colors.online,
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  dateSeparatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textOnDarkMuted,
    letterSpacing: 0.3,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
