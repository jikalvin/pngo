import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  console.log('Onboarding layout rendered');
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="user-type" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}