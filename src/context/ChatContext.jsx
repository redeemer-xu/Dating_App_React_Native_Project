import { createContext, useContext, useState } from "react";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  // { chatId: [messages] }, e.g. { "1": [...], "2": [...] }
  const [chats, setChats] = useState({});

  const updateMessages = (chatId, starterMessages, updater) => {
    setChats((prev) => ({
      ...prev,
      [chatId]: updater(prev[chatId] ?? starterMessages),
    }));
  };

  // Used when someone signs out, so the next person starts clean
  const resetChats = () => setChats({});

  return (
    <ChatContext.Provider value={{ chats, updateMessages, resetChats }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
