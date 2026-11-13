import { Redirect, Tabs } from "expo-router";
import { Flame, Heart, MapPin, User } from "lucide-react-native";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";
import { useMyLocation } from "../../utils/useMyLocation";

export default function TabLayout() {
  const { colors } = useTheme();
  const { currentUser, restoring } = useAuth();
  const { loadInbox, unreadTotal } = useChat();
  const myId = currentUser?.id;

  // useEffect + setInterval: check for new messages every 5 seconds,
  // so the red number on the Matches tab stays up to date
  useEffect(() => {
    if (!myId) return;
    loadInbox();
    const timer = setInterval(loadInbox, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  // GPS: send my location to the server once after logging in
  useMyLocation();

  if (restoring) return null; // still checking the saved login
  if (!currentUser) {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textOnDarkMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.divider,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => <Flame color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ color }) => <Heart color={color} size={24} />,
          // red number = unread messages
          tabBarBadge: unreadTotal > 0 ? unreadTotal : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, color: "#FFFFFF" },
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <MapPin color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
