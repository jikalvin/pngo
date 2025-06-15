import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useDispatch, useSelector } from 'react-redux'; // Added useDispatch
import { store } from '@/store/store';
import '@/i18n/i18n';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Added Firestore imports
import { setAuthenticated, setUser, logout } from '@/store/authSlice';
import firebaseConfig from '../firebaseConfig';
import { RootState } from '@/store/store';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useFrameworkReady(); // Assuming this is for other framework readiness, not fonts

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // Keep splash screen visible while fonts load
  }

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

// New component to house the main app content and auth listener
function AppContent() {
  const dispatch = useDispatch();

  // Firebase Auth Listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => { // Made async
      if (firebaseUser) {
        // User is signed in
        const db = getFirestore();
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const firestoreUserData = userDocSnap.data();
            dispatch(setAuthenticated(true));
            dispatch(
              setUser({
                id: firebaseUser.uid,
                phoneNumber: firebaseUser.phoneNumber,
                email: firebaseUser.email, // Keep this, might be null
                userType: firestoreUserData.userType,
                displayName: firestoreUserData.displayName,
                profileDescription: firestoreUserData.profileDescription,
                // any other relevant fields from firestoreUserData
              })
            );
          } else {
            // Profile not found in Firestore, maybe a new sign-up that hasn't completed profile creation
            // or an error in profile creation step.
            console.warn("User profile not found in Firestore for UID:", firebaseUser.uid);
            dispatch(setAuthenticated(true)); // Still authenticated
            dispatch(
              setUser({ // Set with basic Firebase Auth info
                id: firebaseUser.uid,
                phoneNumber: firebaseUser.phoneNumber,
                email: firebaseUser.email,
                // userType, displayName, etc., will be undefined or null
              })
            );
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          // Handle error, perhaps by logging out the user or setting minimal data
          dispatch(setAuthenticated(true)); // Still authenticated if Firebase says so
          dispatch(
            setUser({ // Set with basic Firebase Auth info
              id: firebaseUser.uid,
              phoneNumber: firebaseUser.phoneNumber,
              email: firebaseUser.email,
            })
          );
        }
      } else {
        // User is signed out
        dispatch(logout());
        // If logging out should always reset onboarding status:
        // dispatch(setOnboardingCompleted(false)); // This might be needed depending on app logic
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [dispatch]);

  // Store initialization check (can be kept if useful)
  useEffect(() => {
    const state = store.getState();
    if (!state || !state.auth) {
      console.warn('Store not properly initialized');
    }
  }, []);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const authStore = useSelector((state: RootState) => state.auth);
  
  // Add a loading state while the store is initializing or auth state is being determined
  if (typeof authStore === 'undefined') {
    return null; // Or a loading spinner
  }

  const { isAuthenticated = false, onboardingCompleted = false } = authStore;
  
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