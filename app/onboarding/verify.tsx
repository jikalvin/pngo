import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Added Firestore imports
import { confirmationResultHolder, setConfirmationResult } from '../../store/tempAuthStore';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useDispatch } from 'react-redux'; // Removed useSelector, RootState
import { setOnboardingCompleted } from '@/store/authSlice';
import { useTranslation } from 'react-i18next';

export default function VerifyScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  // Get phone number and userType from params
  const { phoneNumber, userType } = useLocalSearchParams<{ phoneNumber?: string; userType?: string }>();
  
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleComplete = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert(t('common.error'), t('auth.invalidOtpError')); // Assuming you add this key
      return;
    }

    if (!confirmationResultHolder) {
      Alert.alert(
        t('common.error'),
        t('auth.verificationNotInitiatedError') // Assuming you add this key
      );
      router.back(); // Or navigate to a more appropriate screen
      return;
    }

    try {
      const userCredential = await confirmationResultHolder.confirm(otpCode);
      const firebaseUser = userCredential.user;
      console.log('User signed in with Firebase Auth:', firebaseUser);

      if (!userType) {
        console.error("User type is undefined. Cannot create profile.");
        Alert.alert(t('common.error'), "User type is missing. Profile creation failed.");
        // Potentially log out user or guide them back if this is critical
        setConfirmationResult(null); // Clear holder as we can't proceed
        return;
      }

      // Create user profile in Firestore
      const db = getFirestore();
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userProfileData = {
        uid: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber || phoneNumber, // Prefer firebaseUser.phoneNumber
        userType: userType, // From route params
        createdAt: serverTimestamp(),
        displayName: null, // Or a default like "New User"
        profileDescription: null,
        email: firebaseUser.email || null, // Include if available
      };

      await setDoc(userDocRef, userProfileData, { merge: true });
      console.log('User profile created/updated in Firestore.');

      setConfirmationResult(null); // Clear the holder

      // Onboarding is now complete from Firebase perspective & Firestore profile created
      dispatch(setOnboardingCompleted(true));
      router.replace('/(tabs)'); // Navigate to the main app experience

    } catch (error: any) {
      console.error('OTP Verification or Firestore Error:', error);
      Alert.alert(t('common.error'), error.message || t('auth.invalidOtpError'));
      // Do not clear confirmationResultHolder here to allow retry with the same phone number attempt if it's an OTP error.
      // If it's a Firestore error, the user is authenticated but profile creation failed, which needs handling.
    }
  };
  
  const goBack = () => {
    router.back();
  };
  
  const isComplete = otp.every(digit => digit !== '');

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
          <Text style={styles.title}>{t('auth.verifyPhoneNumber')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.enterVerificationCode')} {phoneNumber ?? ''}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.duration(800).delay(500)}
          style={styles.formContainer}
        >
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={styles.otpInput}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                autoFocus={index === 0}
              />
            ))}
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
              style={[styles.doneButton, (!isComplete && styles.disabledButton)]}
              onPress={handleComplete}
              disabled={!isComplete}
            >
              <Text style={styles.doneButtonText}>{t('common.done')}</Text>
              <ChevronRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    color: Colors.white,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
  },
  formContainer: {
    marginTop: '15%',
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xl * 2,
  },
  otpInput: {
    width: 40,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.primary[100],
    color: Colors.gray[800],
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: fontSizes.lg,
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
  doneButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    fontSize: fontSizes.sm,
    marginRight: spacing.sm,
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
});