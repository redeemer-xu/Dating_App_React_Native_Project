import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';

const AuthContext = createContext({
  isLoggedIn: false,
  isLoading: true,
  hasCompletedOnboarding: false,
  markOnboardingComplete: () => {},
});

const onboardingKey = (uid) => `soulsync_onboarding_completed:${uid}`;
const onboardingDataKey = (uid) => `soulsync_onboarding_data:${uid}`;

export function AuthProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
      setUid(user?.uid ?? null);

      if (user) {
        const stored = await AsyncStorage.getItem(onboardingKey(user.uid));
        setHasCompletedOnboarding(stored === 'true');
      } else {
        setHasCompletedOnboarding(false);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const markOnboardingComplete = async (onboardingData = null) => {
    if (!uid) return;

    await AsyncStorage.setItem(onboardingKey(uid), 'true');

    if (onboardingData) {
      await AsyncStorage.setItem(onboardingDataKey(uid), JSON.stringify(onboardingData));
    }

    setHasCompletedOnboarding(true);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isLoading, hasCompletedOnboarding, markOnboardingComplete }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
