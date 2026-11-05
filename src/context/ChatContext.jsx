import { createContext, useContext, useState } from "react";

const ChatContext = createContext(null);

// Gives every message its own id: "msg-1", "msg-2", ...
let nextMessageId = 1;

// One conversation is shared by 2 people. We sort their ids so
// Redeemer -> Jastin and Jastin -> Redeemer use the SAME key: "jastin__redeemer"
export function chatKey(idA, idB) {
  return [idA, idB].sort().join("__");
}

// "3:07 PM"
function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ChatProvider({ children }) {
  // { "jastin__redeemer": [ { id, senderId, text, time }, ... ] }
  // Kept while the app is open, even when you log out and log in as someone else.
  const [conversations, setConversations] = useState({});

  // All messages between two people (oldest first)
  const getMessages = (myId, otherId) =>
    conversations[chatKey(myId, otherId)] ?? [];

  const sendMessage = (myId, otherId, text) => {
    const key = chatKey(myId, otherId);
    const message = {
      id: `msg-${nextMessageId++}`,
      order: nextMessageId, // bigger = newer (used to sort the inbox)
      senderId: myId,
      text,
      time: timeNow(),
    };
    setConversations((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), message],
    }));
  };

  const deleteMessage = (myId, otherId, messageId) => {
    const key = chatKey(myId, otherId);
    setConversations((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((m) => m.id !== messageId),
    }));
  };

  // My inbox: one item per person I have messages with, newest first
  const getInbox = (myId) =>
    Object.entries(conversations)
      .filter(([key, messages]) => {
        const ids = key.split("__");
        return ids.includes(myId) && messages.length > 0;
      })
      .map(([key, messages]) => {
        const ids = key.split("__");
        const otherId = ids[0] === myId ? ids[1] : ids[0];
        return { otherId, lastMessage: messages[messages.length - 1] };
      })
      .sort((a, b) => b.lastMessage.order - a.lastMessage.order);

  return (
    <ChatContext.Provider
      value={{ getMessages, sendMessage, deleteMessage, getInbox }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
  