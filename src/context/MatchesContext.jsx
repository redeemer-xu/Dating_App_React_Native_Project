import { createContext, useContext, useEffect, useState } from "react";
import {
  apiBlock,
  apiGetBlocks,
  apiGetLikes,
  apiLike,
  apiMarkLikesSeen,
  apiUnblock,
  apiUnlike,
} from "../api";
import { useAuth } from "./AuthContext";

const MatchesContext = createContext(null);

// requests = people who liked me and I haven't liked back (the notifications)
const EMPTY = { owner: null, liked: [], likedBy: [], hidden: [], requests: [] };

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

  // POST /likes (also "Like back": then their notification is done)
  const addMatch = (id) => {
    change((d) => ({
      ...d,
      liked: d.liked.includes(id) ? d.liked : [id, ...d.liked],
      requests: d.requests.filter((r) => r.fromId !== id),
    }));
    // after the server saved it, refresh: maybe it's a match now
    return apiLike(me, id).then(refreshMatches, refreshMatches);
  };

  // POST /likes/seen: the pop-up's "Later", or opening the bell list
  const markLikesSeen = (ids) => {
    if (ids.length === 0) return;
    change((d) => ({
      ...d,
      requests: d.requests.map((r) => (ids.includes(r.fromId) ? { ...r, seen: true } : r)),
    }));
    apiMarkLikesSeen(me, ids).catch(() => {});
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

  // DELETE /blocks/:me/:id (Settings -> Blocked users)
  const unblockUser = async (id) => {
    await apiUnblock(me, id);
    await refreshMatches(); // they can show up in Discover again
  };

  const matchIds = mine.liked; // people I liked
  // both liked each other = a real match (only they show on the Map)
  const mutualIds = mine.liked.filter((id) => mine.likedBy.includes(id));
  // "X liked you" notifications (newest first) and how many are new
  const likeRequests = mine.requests.filter((r) => !mine.hidden.includes(r.fromId));
  const unseenLikes = likeRequests.filter((r) => !r.seen).length;
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
        unblockUser,
        mutualIds,
        likeRequests,
        unseenLikes,
        markLikesSeen,
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
