import { createContext, useContext, useState } from "react";
import {
  apiDeleteMessage,
  apiGetInbox,
  apiGetMessages,
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
    setChat((prev) => ({
      ...update(prev.owner === me ? prev : { ...EMPTY }),
      owner: me,
    }));

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

  // POST /messages
  const sendMessage = async (otherId, text) => {
    const message = await apiSendMessage(me, otherId, text);
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
        [otherId]: (c.conversations[otherId] ?? []).filter(
          (m) => m.id !== messageId,
        ),
      },
    }));
    try {
      await apiDeleteMessage(messageId);
    } catch (err) {
      change((c) => ({ ...c, error: err.message }));
      loadConversation(otherId);
    }
  };

  const getMessages = (otherId) => mine.conversations[otherId] ?? [];
  const getInbox = () => mine.inbox;

  return (
    <ChatContext.Provider
      value={{
        getMessages,
        getInbox,
        loadConversation,
        loadInbox,
        sendMessage,
        deleteMessage,
        chatError: mine.error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
