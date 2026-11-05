import { createContext, useContext, useState } from "react";
import { discoveryProfiles } from "../data/mockData";

const ProfilesContext = createContext(null);

// Every public profile in the app (what others see in Discover).
// Starts with our group mates; new users are added after onboarding.
export function ProfilesProvider({ children }) {
  const [profiles, setProfiles] = useState(discoveryProfiles);

  // Find one profile by its id, e.g. "jastin" or "user-6"
  const getProfile = (id) => profiles.find((p) => p.id === id);

  // Add a new profile, or change an existing one
  const saveProfile = (id, changes) => {
    setProfiles((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) {
        return prev.map((p) => (p.id === id ? { ...p, ...changes } : p));
      }
      const newProfile = {
        id,
        name: "New user",
        age: 18,
        title: "New on SoulSync",
        location: "Cagayan de Oro, PH",
        distance: "1 mile away",
        bio: "New to SoulSync. Say hi!",
        avatar: null,
        images: [],
        tags: [],
        prompts: [],
        ...changes,
      };
      return [...prev, newProfile];
    });
  };

  return (
    <ProfilesContext.Provider value={{ profiles, getProfile, saveProfile }}>
      {children}
    </ProfilesContext.Provider>
  );
}

export const useProfiles = () => useContext(ProfilesContext);
