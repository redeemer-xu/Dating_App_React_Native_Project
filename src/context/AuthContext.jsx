import { createContext, useContext, useState } from "react";
import { apiLogin, apiRegister } from "../api";

const AuthContext = createContext(null);

// Who is logged in. The account itself lives on our FastAPI server.
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // POST /login -> the server checks the email + password
  const login = async (email, password) => {
    const user = await apiLogin(email, password);
    setCurrentUser(user);
    return user;
  };

  // POST /register -> the server creates the account
  const register = async (username, email, password) => {
    const user = await apiRegister(username, email, password);
    setCurrentUser(user);
    return user;
  };

  const logout = () => setCurrentUser(null);

  const isLoggedIn = currentUser !== null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
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
