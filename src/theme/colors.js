// Two color sets: dark (the original look) and light ("soft blush").
// The keys are the same in both, so every screen works with either one.
// Note: "textOnDark" = the main text color of the app
// (white in dark mode, almost black in light mode).

export const darkColors = {
  background: "#0D0D0F",
  card: "#1B171A",
  cardAlt: "#2A1A20",
  divider: "#3A2A30",
  accent: "#E47C83",
  accentSoft: "#3D252D",
  online: "#57C785",
  bubbleIncoming: "#2A2529",
  bubbleOutgoingGradient: ["#E47C83", "#B95768"],
  inputBackground: "#010511",
  border: "#E2E8F0",
  primary: "#E47C83", // main buttons + links (was blue), same pink as accent
  error: "#EF4444",
  white: "#FFFFFF",

  // main text colors
  textOnDark: "#FFFFFF",
  textOnDarkSecondary: "#CBD5E1",
  textOnDarkMuted: "#94A3B8",

  // Text sitting on light surfaces (input fields, secondary button)
  textOnLight: "#0F172A",

  // background gradient (top -> bottom), dark see-through layer behind pop-ups,
  // and the fade at the bottom of a big profile photo
  gradient: ["#6B3F49", "#2A1A20", "#0D0D0F"],
  overlay: "rgba(15,15,17,0.6)",
  photoFade: "rgba(15,15,17,0.95)",
  statusBar: "light",
};

export const lightColors = {
  background: "#FFF5F6",
  card: "#FFFFFF",
  cardAlt: "#FBE9EC",
  divider: "#F1DADF",
  accent: "#D9646E",
  accentSoft: "#FBE1E5",
  online: "#2FA866",
  bubbleIncoming: "#F3E7EA",
  bubbleOutgoingGradient: ["#E47C83", "#B95768"],
  inputBackground: "#FFFFFF",
  border: "#E8CDD3",
  primary: "#D9646E", // main buttons + links (was blue), same pink as accent
  error: "#DC2626",
  white: "#FFFFFF",

  textOnDark: "#1F1A1C",
  textOnDarkSecondary: "#5B5258",
  textOnDarkMuted: "#8E848A",

  textOnLight: "#0F172A",

  gradient: ["#F7D4DA", "#FFEEF1", "#FFF5F6"],
  overlay: "rgba(31,26,28,0.35)",
  photoFade: "rgba(255,245,246,0.95)",
  statusBar: "dark",
};

// Old name, still works for anything that wasn't changed to useTheme()
export const colors = darkColors;
