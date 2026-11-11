import { createContext, useContext, useState } from "react";
import {
  apiDeleteMessage,
  apiGetInbox,
  apiGetMessages,
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
        chatError: mine.error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
