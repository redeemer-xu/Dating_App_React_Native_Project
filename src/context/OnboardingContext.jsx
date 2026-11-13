import { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext(null);

const initialState = {
  firstName: '',
  birthday: '',
  gender: null, // 'Man' or 'Woman'
  showMe: 'Everyone',
  lookingFor: [],
  photo: null, // profile picture picked from the gallery
  extraPhotos: [], // up to 5 more photos (optional)
  verificationPhoto: null, // selfie from the front camera (optional)
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
