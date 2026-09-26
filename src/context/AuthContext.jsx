import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // The whiteboard's contents
  const [currentUser, setCurrentUser] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);

  // BLANK 1: save the user who just logged in
  const login = (user) => {
    setCurrentUser(user);
  };

  // BLANK 2: clear everything when signing out
  const logout = () => {
    setCurrentuser(null);
    setHasCompletedOnboarding(false);
    setOnboardingData(null);
  };

  const markOnboardingComplete = (data = null) => {
    setHasCompletedOnboarding(true);
    if (data) setOnboardingData(data);
  };

  // BLANK 3: true if someone is logged in, false if not
  const isLoggedIn = currentUser !== null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        hasCompletedOnboarding,
        onboardingData,
        login,
        logout,
        markOnboardingComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}