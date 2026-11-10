import { createContext, useContext, useEffect, useState } from "react";
import { apiGetUsers, apiUpdateUser } from "../api";
import { useAuth } from "./AuthContext";

const ProfilesContext = createContext(null);

// Every public profile (what people see in Discover), loaded from the server.
export function ProfilesProvider({ children }) {
  const { currentUser, setCurrentUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET /users
  const refreshProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      setProfiles(await apiGetUsers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect: load the profiles every time someone logs in
  const myId = currentUser?.id;
  useEffect(() => {
    // loading data from the server is a normal job for useEffect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (myId) refreshProfiles();
  }, [myId]);

  // Find one profile by its id. (My own profile works even before onboarding.)
  const getProfile = (id) =>
    profiles.find((p) => p.id === String(id)) ??
    (currentUser?.id === String(id) ? currentUser : undefined);

  // PATCH /users/:id -> save changes (new photos are uploaded first)
  const saveProfile = async (id, changes) => {
    const updated = await apiUpdateUser(id, changes);
    setProfiles((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) return prev.map((p) => (p.id === updated.id ? updated : p));
      return updated.onboarded ? [...prev, updated] : prev;
    });
    if (currentUser?.id === updated.id) setCurrentUser(updated);
    return updated;
  };

  return (
    <ProfilesContext.Provider
      value={{
        profiles,
        loading,
        error,
        refreshProfiles,
        getProfile,
        saveProfile,
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
}

export const useProfiles = () => useContext(ProfilesContext);
