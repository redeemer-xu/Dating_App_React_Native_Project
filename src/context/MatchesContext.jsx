import { createContext, useContext, useEffect, useState } from "react";
import {
  apiBlock,
  apiGetBlocks,
  apiGetLikes,
  apiLike,
  apiUnlike,
} from "../api";
import { useAuth } from "./AuthContext";

const MatchesContext = createContext(null);

const EMPTY = { owner: null, liked: [], likedBy: [], hidden: [] };

// Likes and blocks of the logged-in user, saved on the server.
export function MatchesProvider({ children }) {
  const { currentUser } = useAuth();
  const me = currentUser?.id;

  // "owner" = whose data this is. If someone else logs in, we start empty.
  const [data, setData] = useState(EMPTY);
  const mine = data.owner === me ? data : EMPTY;

  // GET /users/:id/likes and GET /users/:id/blocks
  const refreshMatches = async () => {
    if (!me) return;
    try {
      const [likes, blocks] = await Promise.all([
        apiGetLikes(me),
        apiGetBlocks(me),
      ]);
      setData({ owner: me, ...likes, hidden: blocks.hidden });
    } catch {
      // server not reachable: keep what we have, the screen shows the error elsewhere
    }
  };

  // useEffect: load my likes/blocks when I log in
  useEffect(() => {
    // loading data from the server is a normal job for useEffect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (me) refreshMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  // Update the screen right away, then tell the server
  const change = (update) =>
    setData((prev) => ({
      ...update(prev.owner === me ? prev : { ...EMPTY, owner: me }),
      owner: me,
    }));

  // POST /likes
  const addMatch = (id) => {
    change((d) =>
      d.liked.includes(id) ? d : { ...d, liked: [id, ...d.liked] },
    );
    apiLike(me, id).catch(refreshMatches);
  };

  // DELETE /likes/:me/:id
  const removeMatch = (id) => {
    change((d) => ({ ...d, liked: d.liked.filter((x) => x !== id) }));
    apiUnlike(me, id).catch(refreshMatches);
  };

  // POST /blocks (the server also removes my like)
  const blockUser = (id) => {
    change((d) => ({
      ...d,
      liked: d.liked.filter((x) => x !== id),
      hidden: d.hidden.includes(id) ? d.hidden : [...d.hidden, id],
    }));
    apiBlock(me, id).catch(refreshMatches);
  };

  const matchIds = mine.liked; // people I liked
  const isHidden = (id) => mine.hidden.includes(String(id)); // blocked either way
  // people who liked me, that I have not liked back yet
  const admirerIds = mine.likedBy.filter(
    (id) => !mine.liked.includes(id) && !mine.hidden.includes(id),
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
        refreshMatches,
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
}

export const useMatches = () => useContext(MatchesContext);
