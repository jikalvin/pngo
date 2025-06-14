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

  // useEffect for hiding splash screen is now inside RootLayoutNav
  // to coordinate with auth loading state.
  // The direct call to SplashScreen.hideAsync() based only on fonts
  // will be removed from RootLayout and handled in RootLayoutNav.

  // This initial check for fonts is still useful to prevent RootLayoutNav from rendering
  // prematurely if fonts are the only thing pending.
   if (!fontsLoaded && !fontError) { // This check remains in RootLayout
     return null;
   }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Pass fontsLoaded and fontError as props to RootLayoutNav */}
        <RootLayoutNav fontsLoaded={fontsLoaded} fontError={fontError} />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </Provider>
  );
}

interface RootLayoutNavProps {
  fontsLoaded: boolean;
  fontError: any;
}

function RootLayoutNav({ fontsLoaded, fontError }: RootLayoutNavProps) {
  const { isLoading, isAuthenticated, onboardingCompleted } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Hide splash screen only when both fonts are loaded/failed AND auth is no longer loading.
    if ((fontsLoaded || fontError) && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  // If fonts are still loading OR auth state is still loading (initial token check),
  // return null to keep the splash screen visible.
  if (!fontsLoaded && !fontError || isLoading) {
    return null;
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        onboardingCompleted ? (
          <>
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="create" options={{ presentation: 'modal' }} />
            {/* <Stack.Screen name="package" options={{ presentation: 'card' }} /> */}
          </>
        ) : (
          <Stack.Screen name="onboarding/index" options={{ animation: 'fade' }} />
        )
      ) : (
        <Stack.Screen name="onboarding/index" options={{ animation: 'fade' }} />
      )}
      <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
    </Stack>
  );
}