import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; // Removed getAuth
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Removed getFirestore
import { auth, db } from '../../firebase/init'; // Import initialized services
import { useDispatch } from 'react-redux';
import { setOnboardingCompleted } from '../../store/authSlice';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const { t } = useTranslation();
  const { userType: userTypeParam } = useLocalSearchParams(); // Renamed for clarity
  const dispatch = useDispatch(); // Initialize dispatch

  const handleAuthentication = async () => {
    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleSignIn();
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert(t('auth.alertAuthErrorTitle'), t('auth.alertValidationEmailPassword'));
      return;
    }
    // const auth = getAuth(); // Use imported auth
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Use imported auth
      const firebaseUser = userCredential.user;
      console.log('Sign Up Successful (Firebase Auth):', firebaseUser);

      const userType = Array.isArray(userTypeParam) ? userTypeParam[0] : userTypeParam;

      if (!userType) {
        console.error("User role not specified. Cannot complete registration.");
        Alert.alert(t('auth.alertAuthErrorTitle'), t('auth.alertUserRoleMissing'));
        // Consider deleting firebaseUser here if profile creation is critical path
        // await firebaseUser.delete();
        return;
      }

      // const db = getFirestore(); // Use imported db
      const userDocRef = doc(db, 'users', firebaseUser.uid); // Use imported db
      const userProfileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        userType: userType,
        createdAt: serverTimestamp(),
        displayName: firebaseUser.email?.split('@')[0] || 'New User', // Default display name
        profileDescription: null,
        phoneNumber: null,
      };

      try {
        await setDoc(userDocRef, userProfileData);
        console.log("User profile created in Firestore for UID:", firebaseUser.uid);

        dispatch(setOnboardingCompleted(true));
        Alert.alert(t('auth.alertSignUpSuccessTitle'), t('auth.alertSignUpSuccessMessage'));
        router.replace('/(tabs)');

      } catch (firestoreError: any) {
        console.error("Error creating user profile in Firestore:", firestoreError);
        Alert.alert(t('auth.alertAuthErrorTitle'), firestoreError.message || "Failed to set up your profile. Please try again or contact support.");
      }

    } catch (error: any) {
      Alert.alert(t('auth.alertAuthErrorTitle'), error.message);
      console.error('Firebase Auth Sign Up Error:', error);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(t('auth.alertAuthErrorTitle'), t('auth.alertValidationEmailPassword'));
      return;
    }
    // const auth = getAuth(); // Use imported auth
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Use imported auth
      console.log('Sign In Successful:', userCredential.user);
      Alert.alert(t('auth.alertSignInSuccessTitle'), t('auth.alertSignInSuccessMessage'));
    } catch (error: any) {
      Alert.alert(t('auth.alertAuthErrorTitle'), error.message);
      console.error('Sign In Error:', error);
    }
  };
  
  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/8993561/pexels-photo-8993561.jpeg' }}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.content}>
        <Animated.View 
          entering={FadeIn.duration(800).delay(300)}
          style={styles.headerContainer}
        >
          <Text style={styles.title}>{isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle')}</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.duration(800).delay(500)}
          style={styles.formContainer}
        >
          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>{t('common.email')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={Colors.gray[400]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>{t('common.password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={Colors.gray[400]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={goBack}
            >
              <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuthentication}
            >
              <Text style={styles.authButtonText}>
                {isSignUp ? t('auth.signUpButton') : t('auth.signInButton')}
              </Text>
              <ChevronRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.toggleAuthModeButton} onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.toggleAuthModeText}>
              {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
              {isSignUp ? t('auth.signInButton') : t('auth.signUpButton')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  // recaptchaPlaceholder style removed
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  headerContainer: {
    marginTop: '10%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSizes.xxl,
    color: Colors.primary.DEFAULT,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  formContainer: {
    marginTop: '15%',
    alignItems: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.primary.DEFAULT,
    marginBottom: spacing.xs, // Reduced margin for tighter layout
  },
  inputFieldContainer: { // New container for label + input
    width: '100%',
    marginBottom: spacing.md, // Spacing between email and password fields
  },
  input: { // Style for new TextInputs
    backgroundColor: Colors.primary[100],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary.DEFAULT,
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.primary.DEFAULT,
  },
  authButton: { // Renamed from continueButton
    flexDirection: 'row',
    backgroundColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonText: { // Renamed from continueButtonText
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    fontSize: fontSizes.sm,
    marginRight: spacing.sm,
  },
  // disabledButton style can be kept if needed for authButton
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
  toggleAuthModeButton: { // Renamed from emailContainer
    marginTop: spacing.lg, // Adjusted margin
    paddingVertical: spacing.sm,
  },
  toggleAuthModeText: { // Renamed from emailText
    fontFamily: 'Poppins-Medium',
    color: Colors.primary.DEFAULT,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
});