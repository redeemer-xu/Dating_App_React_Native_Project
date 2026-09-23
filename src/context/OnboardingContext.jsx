import { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext(null);

const initialState = {
  firstName: '',
  birthday: '',
  showMe: 'Everyone',
  lookingFor: [],
  photos: Array(6).fill(null),
  interests: [],
  promptQuestion: '',
  promptAnswer: '',
};

export function OnboardingProvider({ children }) {
  const [data, setData] = useState(initialState);

  const update = (patch) => setData((prev) => ({ ...prev, ...patch }));
  const reset = () => setData(initialState);

  return (
    <OnboardingContext.Provider value={{ data, update, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
}
