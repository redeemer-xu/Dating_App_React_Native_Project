import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "../theme/colors";

const ThemeContext = createContext(null);
const STORAGE_KEY = "soulsync-theme"; // where the choice is saved on the phone

// mode = what you picked in Settings: "dark", "light" or "system"
// "system" = follow the phone's own dark/light setting
export function ThemeProvider({ children }) {
  const phoneScheme = useColorScheme(); // "dark" or "light" from the phone
  const [mode, setModeState] = useState("dark");

  // useEffect + AsyncStorage: when the app opens, load the saved choice
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "dark" || saved === "light" || saved === "system") {
          setModeState(saved);
        }
      })
      .catch(() => {}); // nothing saved yet = stay dark
  }, []);

  // change the theme AND save it, so it stays after closing the app
  const setMode = (newMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {});
  };

  const scheme = mode === "system" ? (phoneScheme ?? "dark") : mode;
  const colors = scheme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, setMode, scheme, isDark: scheme === "dark", colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
