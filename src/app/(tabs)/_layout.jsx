import { Redirect, Tabs } from "expo-router";
import { Flame, Heart, MapPin, User } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import LikePopup from "../../components/LikePopup";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useMatches } from "../../context/MatchesContext";
import { useProfiles } from "../../context/ProfilesContext";
import { useTheme } from "../../context/ThemeContext";
import { useMyLocation } from "../../utils/useMyLocation";

export default function TabLayout() {
  const { colors } = useTheme();
  const { currentUser, restoring } = useAuth();
  const { loadInbox, unreadTotal } = useChat();
  const { refreshMatches } = useMatches();
  const { refreshProfiles } = useProfiles();
  const myId = currentUser?.id;

  // useEffect + setInterval: every 5 seconds check for new messages (red number
  // on Matches) and new likes (the "X liked you" pop-up and the bell).
  // Every 30 seconds also get new profiles (so a new user's like has a name).
  useEffect(() => {
    if (!myId) return;
    let ticks = 0;
    const check = () => {
      loadInbox();
      refreshMatches();
      if (ticks % 6 === 0) refreshProfiles();
      ticks += 1;
    };
    check();
    const timer = setInterval(check, 5000);
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
    <View style={{ flex: 1 }}>
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
            tabBarBadgeStyle: {
              backgroundColor: colors.accent,
              color: "#FFFFFF",
            },
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
      {/* "Jastin liked you" pop-up, on top of every tab */}
      <LikePopup />
    </View>
  );
}
