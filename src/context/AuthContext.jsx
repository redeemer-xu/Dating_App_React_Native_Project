import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { apiGetUser, apiLogin, apiRegister } from "../api";

const AuthContext = createContext(null);
const STORAGE_KEY = "soulsync-user-id"; // only the id is saved, never the password

// Who is logged in. The account itself lives on our FastAPI server.
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [restoring, setRestoring] = useState(true); // true while the app checks "was I logged in?"
  const [restoreError, setRestoreError] = useState(null);

  // Load the saved account: AsyncStorage gives the id, the server gives the latest profile
  const loadSavedUser = () =>
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (savedId) => {
        if (!savedId) return; // nobody was logged in
        try {
          setCurrentUser(await apiGetUser(savedId));
        } catch (err) {
          if (err.message.includes("not found")) {
            // the account was deleted -> forget it
            await AsyncStorage.removeItem(STORAGE_KEY);
          } else {
            setRestoreError(err.message); // server off / wrong WiFi
          }
        }
      })
      .catch(() => {})
      .finally(() => setRestoring(false));

  // useEffect: runs once when the app opens
  useEffect(() => {
    loadSavedUser();
  }, []);

  // "Try again" button when the server could not be reached
  const retryRestore = () => {
    setRestoreError(null);
    setRestoring(true);
    loadSavedUser();
  };

  const remember = (user) => AsyncStorage.setItem(STORAGE_KEY, String(user.id)).catch(() => {});

  // POST /login -> the server checks the email + password
  const login = async (email, password) => {
    const user = await apiLogin(email, password);
    setCurrentUser(user);
    remember(user);
    return user;
  };

  // POST /register -> the server creates the account
  const register = async (username, email, password) => {
    const user = await apiRegister(username, email, password);
    setCurrentUser(user);
    remember(user);
    return user;
  };

  // Sign out (or deleted account): forget the saved id too
  const logout = () => {
    setCurrentUser(null);
    setRestoreError(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  const isLoggedIn = currentUser !== null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        restoring,
        restoreError,
        retryRestore,
        login,
        register,
        logout,
        setCurrentUser, // used after the server sends back an updated profile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
