import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
// Assuming firebaseConfig.ts exports the config object directly, not an initialized app.
// We get auth from getAuth()
import firebaseConfig from '../../firebaseConfig'; // Adjusted path based on file location
import { setConfirmationResult } from '../../store/tempAuthStore'; // Added import
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

// Initialize Firebase Auth
const auth = getAuth();

export default function SignInScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+237');
  // const [confirmation, setConfirmation] = useState<any>(null); // Removed state
  const { t } = useTranslation();
  const { userType } = useLocalSearchParams();
  const recaptchaVerifierRef = useRef<any>(null);
  const recaptchaContainerRef = useRef<any>(null); // Ref for the View

  useEffect(() => {
    // Ensure firebaseConfig is initialized before this runs if needed by getAuth()
    // For client-side SDK, getAuth() usually handles initialization if Firebase app is initialized.
    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
      // The 'recaptcha-container' div ID is expected by RecaptchaVerifier.
      // In React Native, this is tricky. We are assigning a ref to a View.
      // This standard web RecaptchaVerifier might not work directly.
      // Expo offers FirebaseRecaptchaVerifierModal for a more RN-idiomatic approach.
      // For this task, we follow the instruction using the web verifier.
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          recaptchaContainerRef.current, // Giving the View node. This is the problematic part.
          {
            size: 'invisible',
            callback: (response: any) => {
              // reCAPTCHA solved, allow signInWithPhoneNumber.
              // console.log("reCAPTCHA solved:", response);
            },
            'expired-callback': () => {
              // Response expired. Ask user to solve reCAPTCHA again.
              // console.log("reCAPTCHA expired");
            },
          }
        );
        recaptchaVerifierRef.current = window.recaptchaVerifier;
        // It's common to render the verifier initially if it's not 'invisible'
        // For 'invisible', it triggers when needed.
        // recaptchaVerifierRef.current.render().catch(console.error);
      } catch (error) {
        console.error("Error initializing RecaptchaVerifier:", error);
        Alert.alert("Error", "Failed to initialize reCAPTCHA verifier.");
      }
    }
    // Cleanup on unmount if necessary, though RecaptchaVerifier might handle its own cleanup.
    return () => {
      // if (recaptchaVerifierRef.current) {
      //   recaptchaVerifierRef.current.clear(); // Example cleanup
      // }
    };
  }, [auth]); // Add auth to dependency array

  const handleContinue = async () => {
    if (!phoneNumber) {
      Alert.alert(t('auth.enterPhoneNumber'));
      return;
    }
    if (!recaptchaVerifierRef.current) {
      Alert.alert("Error", "reCAPTCHA verifier not initialized.");
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        recaptchaVerifierRef.current
      );
      setConfirmationResult(confirmationResult); // Use imported setter
      // Navigate to verify screen, pass phone number and user type
      // confirmationResult itself is complex and not easily passable via params.
      // The verify screen will need to use this confirmationResult.
      // For now, we store it in state; the verify screen will need a way to access it.
      // This will be handled in the next subtask for verify.tsx.
      router.push({
        pathname: '/onboarding/verify',
        params: { userType: userType as string, phoneNumber: fullPhoneNumber },
      });
    } catch (error: any) {
      console.error('Firebase Phone Auth Error:', error);
      Alert.alert(t('common.error'), error.message || t('auth.phoneSignInError'));
      // It's good practice to reset the reCAPTCHA verifier on error if needed
      // grecaptcha.reset(window.recaptchaWidgetId); or similar for web
      // For invisible, it might reset automatically or need specific handling.
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
          <Text style={styles.title}>{t('auth.signInTitle')}</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.duration(800).delay(500)}
          style={styles.formContainer}
        >
          {/* This View is a placeholder for the reCAPTCHA verifier.
              It might need to be a WebView or use a specific Expo component
              for Firebase reCAPTCHA to work correctly in React Native.
              Using testID as 'id' is a workaround assumption.
              It should be styled to be invisible or correctly overlayed if visible. */}
          <View testID="recaptcha-container" ref={recaptchaContainerRef} style={styles.recaptchaPlaceholder} />

          <Text style={styles.label}>{t('common.phoneNumber')}</Text>
          <View style={styles.phoneInputContainer}>
            <TouchableOpacity style={styles.countryCodeContainer}>
              <Text style={styles.countryCode}>{countryCode}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder={t('auth.enterPhoneNumber')}
              placeholderTextColor={Colors.gray[400]}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={15}
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
              style={[styles.continueButton, (!phoneNumber && styles.disabledButton)]}
              onPress={handleContinue}
              disabled={!phoneNumber}
            >
              <Text style={styles.continueButtonText}>{t('common.continue')}</Text>
              <ChevronRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.emailContainer}>
            <Text style={styles.emailText}>{t('auth.useEmail')}</Text>
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
  recaptchaPlaceholder: {
    // Assuming 'invisible' reCAPTCHA, this might not need explicit styling
    // or could be { width: 0, height: 0, position: 'absolute' }
    // If it's a visible one, it would need actual dimensions.
    width: 0,
    height: 0,
  },
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
    marginBottom: spacing.sm,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.xl * 2,
  },
  countryCodeContainer: {
    backgroundColor: Colors.primary[100],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  countryCode: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  phoneInput: {
    flex: 1,
    backgroundColor: Colors.primary[100],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
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
  continueButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    fontSize: fontSizes.sm,
    marginRight: spacing.sm,
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
  emailContainer: {
    marginTop: spacing.xl * 2,
    borderWidth: 1,
    borderColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  emailText: {
    fontFamily: 'Poppins-Medium',
    color: Colors.primary.DEFAULT,
    fontSize: fontSizes.sm,
  },
});