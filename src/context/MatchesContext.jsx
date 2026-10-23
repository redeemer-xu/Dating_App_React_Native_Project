import { createContext, useContext, useState } from "react";
import { chatThreads } from "../data/mockData";

const MatchesContext = createContext(null);

export function MatchesProvider({ children }) {
  // List of matched people's ids, e.g. ["maya", "leo"]
  // People you already have a conversation with start as matches.
  const [matchIds, setMatchIds] = useState(Object.keys(chatThreads));

  const addMatch = (id) => {
    // newest match goes first, and nobody is added twice
    setMatchIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));
  };

  return (
    <MatchesContext.Provider value={{ matchIds, addMatch }}>
      {children}
    </MatchesContext.Provider>
  );
}

export const useMatches = () => useContext(MatchesContext);
