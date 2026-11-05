import { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

const MatchesContext = createContext(null);

export function MatchesProvider({ children }) {
  const { currentUser } = useAuth();
  const me = currentUser?.profileId; // the logged-in person's profile id

  // Who liked who: { "redeemer": ["jastin", "jennifer"], "jastin": ["redeemer"] }
  const [likes, setLikes] = useState({});
  // Who blocked who: { "redeemer": ["tthrystan"] }
  const [blocks, setBlocks] = useState({});

  // The people I liked (my matches), newest first
  const matchIds = likes[me] ?? [];

  const addMatch = (id) => {
    setLikes((prev) => {
      const mine = prev[me] ?? [];
      if (mine.includes(id)) return prev; // nobody is added twice
      return { ...prev, [me]: [id, ...mine] };
    });
  };

  const removeMatch = (id) => {
    setLikes((prev) => ({
      ...prev,
      [me]: (prev[me] ?? []).filter((matchId) => matchId !== id),
    }));
  };

  // Block: hide them from me AND me from them, and unmatch
  const blockUser = (id) => {
    setBlocks((prev) => {
      const mine = prev[me] ?? [];
      return mine.includes(id) ? prev : { ...prev, [me]: [...mine, id] };
    });
    removeMatch(id);
  };

  // true if one of us blocked the other
  const isHidden = (id) =>
    (blocks[me] ?? []).includes(id) || (blocks[id] ?? []).includes(me);

  // People who liked me, that I have not liked back yet (secret admirers)
  const admirerIds = Object.keys(likes).filter(
    (likerId) =>
      likerId !== me &&
      likes[likerId].includes(me) &&
      !matchIds.includes(likerId) &&
      !isHidden(likerId),
  );

  return (
    <MatchesContext.Provider
      value={{
        matchIds,
        addMatch,
        removeMatch,
        blockUser,
        isHidden,
        admirerIds,
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
}

export const useMatches = () => useContext(MatchesContext);
