import { Redirect, Tabs } from "expo-router";
import { Flame, Heart } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

export default function TabLayout() {
  const { currentUser } = useAuth();

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
        }}
      />
    </Tabs>
  );
}
