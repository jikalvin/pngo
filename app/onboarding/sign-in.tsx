import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '@/store/authSlice'; // Import registerUser
import type { AppDispatch, RootState } from '@/store/store';
import { useTranslation } from 'react-i18next';

export default function SignInScreen() {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In and Sign Up
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { userType: routeUserType } = useLocalSearchParams<{userType: 'user' | 'picker'}>(); // Get userType from route params

  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If authenticated, and we are in sign-in mode (not immediately after registration)
    // or if user object becomes available after registration indicates success beyond just token
    if (isAuthenticated && !isLoading) {
      if (isSignUp && user) { // Successfully registered and user data is available
        // Navigate to verification or next step after registration
        router.replace('/onboarding/verify'); // Or based on your app flow
      } else if (!isSignUp) { // Successfully logged in
        router.replace('/(tabs)/');
      }
    }
  }, [isAuthenticated, isLoading, isSignUp, user, router]);
  
  const handleAuthAction = async () => {
    if (isLoading) return;

    if (isSignUp) {
      if (password !== confirmPassword) {
        // Handle password mismatch error locally or dispatch an action
        dispatch({ type: 'auth/registerFailure', payload: t('auth.errors.passwordsDoNotMatch') });
        return;
      }
      // Ensure userType is passed correctly from route params or a default
      const userTypeForRegistration = routeUserType || 'user'; // Default to 'user' if not provided
      await dispatch(registerUser({ fullName, email, phoneNumber, password, userType: userTypeForRegistration }));
    } else {
      // Use email for login if it's provided, otherwise use phoneNumber.
      // The backend should be configured to handle this (e.g., one field for login identifier).
      const loginIdentifier = email || phoneNumber;
      await dispatch(loginUser({ login: loginIdentifier, password, userType: routeUserType }));
    }
  };
  
  const goBack = () => {
    if (isSignUp) {
      setIsSignUp(false); // If in sign up mode, toggle back to sign in
    } else {
      router.back(); // Otherwise, go to previous screen (user-type)
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    // Reset fields and errors
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setPassword('');
    setConfirmPassword('');
    dispatch({ type: 'auth/setError', payload: null }); // Assuming you have a generic setError reducer
  };

  const canSubmit = () => {
    if (isLoading) return false;
    if (isSignUp) {
      return fullName && email && phoneNumber && password && confirmPassword;
    }
    return (email || phoneNumber) && password;
  }

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
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
          {isSignUp && (
            <>
              <Text style={styles.label}>{t('common.fullName')}</Text>
              <TextInput
                style={styles.inputField}
                placeholder={t('auth.enterFullName')}
                placeholderTextColor={Colors.gray[400]}
                value={fullName}
                onChangeText={setFullName}
              />
            </>
          )}

          <Text style={styles.label}>{t('common.email')}</Text>
          <TextInput
            style={styles.inputField}
            placeholder={t('auth.enterEmail')}
            placeholderTextColor={Colors.gray[400]}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t('common.phoneNumber')}</Text>
          <TextInput
            style={styles.inputField}
            placeholder={t('auth.enterPhoneNumber')}
            placeholderTextColor={Colors.gray[400]}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={styles.label}>{t('common.password')}</Text>
          <TextInput
            style={styles.inputField}
            placeholder={t('auth.enterPassword')}
            placeholderTextColor={Colors.gray[400]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {isSignUp && (
            <>
              <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
              <TextInput
                style={styles.inputField}
                placeholder={t('auth.enterConfirmPassword')}
                placeholderTextColor={Colors.gray[400]}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={goBack}
              disabled={isLoading}
            >
              <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.continueButton, (!canSubmit()) && styles.disabledButton]}
              onPress={handleAuthAction}
              disabled={!canSubmit()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>
                    {isSignUp ? t('auth.signUpButton') : t('auth.signInButton')}
                  </Text>
                  <ChevronRight size={20} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.toggleAuthModeButton} onPress={toggleAuthMode} disabled={isLoading}>
            <Text style={styles.toggleAuthModeButtonText}>
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSizes.xxl,
    color: Colors.primary.DEFAULT,
    textAlign: 'center',
  },
  formContainer: {
    alignItems: 'center',
    width: '100%',
  },
  label: {
    alignSelf: 'flex-start',
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.primary.DEFAULT,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  inputField: { // Consolidated style for all text inputs
    backgroundColor: Colors.primary[100],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
    width: '100%',
    marginBottom: spacing.sm,
  },
  errorText: {
    color: Colors.danger.DEFAULT,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary.DEFAULT,
    borderRadius: 8,
    flex: 0.48, // Assign width proportions
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.primary.DEFAULT,
    marginLeft: spacing.xs,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    flex: 0.48, // Assign width proportions
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
  toggleAuthModeButton: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  toggleAuthModeButtonText: {
    fontFamily: 'Poppins-Medium',
    color: Colors.primary.DEFAULT,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
});