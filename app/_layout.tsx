import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import '@/i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  // Add store initialization check
  useEffect(() => {
    // Ensure store is initialized
    const state = store.getState();
    if (!state || !state.auth) {
      console.warn('Store not properly initialized');
    }
  }, []);

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </Provider>
  );
}

function RootLayoutNav() {
  const auth = useSelector((state: RootState) => state.auth);
  
  // Add a loading state while the store is initializing
  if (typeof auth === 'undefined') {
    return null; // Or you could return a loading spinner here
  }

  // Now we can safely destructure since we know auth exists
  const { isAuthenticated = false, onboardingCompleted = false } = auth;
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated || !onboardingCompleted ? (
        <Stack.Screen name="onboarding/index" options={{ animation: 'fade' }} />
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="create" options={{ presentation: 'modal' }} />
          {/* <Stack.Screen name="package" options={{ presentation: 'card' }} /> */}
        </>
      )}
      <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
    </Stack>
  );
}