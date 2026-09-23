import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack initialRouteName="step-1" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="step-1" />
      <Stack.Screen name="step-2" />
      <Stack.Screen name="step-3" />
    </Stack>
  );
}
