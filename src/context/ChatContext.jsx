import { createContext, useContext, useState } from "react";
import {
  apiDeleteMessage,
  apiGetInbox,
  apiGetMessages,
  apiMarkRead,
  apiReact,
  apiRemoveReaction,
  apiSendMessage,
} from "../api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

const EMPTY = { owner: null, conversations: {}, inbox: [], error: null };

// Messages are saved on the server, so the other person really receives them.
export function ChatProvider({ children }) {
  const { currentUser } = useAuth();
  const me = currentUser?.id;

  // "owner" = whose chats these are. If someone else logs in, we start empty.
  const [chat, setChat] = useState(EMPTY);
  const mine = chat.owner === me ? chat : EMPTY;

  const change = (update) =>
    setChat((prev) => ({ ...update(prev.owner === me ? prev : { ...EMPTY }), owner: me }));

  // GET /messages?user_a=me&user_b=other
  const loadConversation = async (otherId) => {
    if (!me) return;
    try {
      const messages = await apiGetMessages(me, otherId);
      change((c) => ({
        ...c,
        error: null,
        conversations: { ...c.conversations, [otherId]: messages },
      }));
      // New messages from them that I haven't read? I'm looking at them now -> "seen"
      const hasUnread = messages.some((m) => m.senderId !== me && !m.seen);
      if (hasUnread) {
        await apiMarkRead(me, otherId);
        change((c) => ({
          ...c,
          inbox: c.inbox.map((item) =>
            item.otherId === String(otherId) ? { ...item, unread: 0 } : item,
          ),
        }));
      }
    } catch (err) {
      change((c) => ({ ...c, error: err.message }));
    }
  };

  // GET /users/:me/inbox
  const loadInbox = async () => {
    if (!me) return;
    try {
      const inbox = await apiGetInbox(me);
      change((c) => ({ ...c, error: null, inbox }));
    } catch (err) {
      change((c) => ({ ...c, error: err.message }));
    }
  };

  // Change one message in a conversation (used for reactions)
  const replaceMessage = (otherId, messageId, update) =>
    change((c) => ({
      ...c,
      conversations: {
        ...c.conversations,
        [otherId]: (c.conversations[otherId] ?? []).map((m) =>
          m.id === messageId ? update(m) : m,
        ),
      },
    }));

  // POST /messages (text and/or a photo)
  const sendMessage = async (otherId, text, photo = null) => {
    const message = await apiSendMessage(me, otherId, text, photo);
    change((c) => ({
      ...c,
      error: null,
      conversations: {
        ...c.conversations,
        [otherId]: [...(c.conversations[otherId] ?? []), message],
      },
    }));
  };

  // DELETE /messages/:id
  const deleteMessage = async (otherId, messageId) => {
    change((c) => ({
      ...c,
      conversations: {
        ...c.conversations,
        [otherId]: (c.conversations[otherId] ?? []).filter((m) => m.id !== messageId),
      },
    }));
    try {
      await apiDeleteMessage(messageId);
    } catch (err) {
      change((c) => ({ ...c, error: err.message }));
      loadConversation(otherId);
    }
  };

  // React to a message. Picking the same reaction again removes it.
  const reactToMessage = async (otherId, message, reaction) => {
    const removing = message.reactions?.[me] === reaction;
    // show it right away (optimistic), then tell the server
    replaceMessage(otherId, message.id, (m) => {
      const reactions = { ...(m.reactions ?? {}) };
      if (removing) delete reactions[me];
      else reactions[me] = reaction;
      return { ...m, reactions };
    });
    try {
      const saved = removing
        ? await apiRemoveReaction(message.id, me)
        : await apiReact(message.id, me, reaction);
      replaceMessage(otherId, message.id, () => saved);
    } catch (err) {
      change((c) => ({ ...c, error: err.message }));
      loadConversation(otherId); // undo: get the real data again
    }
  };

  const getMessages = (otherId) => mine.conversations[otherId] ?? [];
  const getInbox = () => mine.inbox;
  // total unread messages = the red number on the Matches tab
  const unreadTotal = mine.inbox.reduce((sum, item) => sum + (item.unread ?? 0), 0);

  return (
    <ChatContext.Provider
      value={{
        getMessages,
        getInbox,
        loadConversation,
        loadInbox,
        sendMessage,
        deleteMessage,
        reactToMessage,
        unreadTotal,
        chatError: mine.error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
