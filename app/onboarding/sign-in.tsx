import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setUser } from '@/store/authSlice';
import { useTranslation } from 'react-i18next';

import { loginUser } from '@/utils/api'; // Assuming utils/api.js is aliased as @/utils/api
import * as AuthStorage from '@/utils/authStorage'; // Assuming utils/authStorage.js is aliased

export default function SignInScreen() {
  const [username, setUsername] = useState(''); // Changed from phoneNumber
  const [password, setPassword] = useState(''); // Added password field
  const [error, setError] = useState('');
  // const [countryCode, setCountryCode] = useState('+237'); // Keep if username is phone
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { userType: routeUserType } = useLocalSearchParams(); // userType from route params, if any
  
  const handleSignIn = async () => {
    if (!username || !password) {
      setError(t('auth.fillFields'));
      return;
    }
    setError('');
    try {
      // The userType from routeUserType might be relevant if sign-in behavior differs by type,
      // but login endpoint itself doesn't take userType. Role comes from backend.
      const response = await loginUser(username, password); // API call
      
      if (response.token && response.user) {
        await AuthStorage.storeToken(response.token);
        await AuthStorage.storeUserData(response.user); // Store full user object {id, username, role}
        
        dispatch(setAuthenticated(true));
        // Adapt the payload for existing setUser in authSlice
        // Existing: { id, email, phoneNumber, userType }
        // Backend: { id, username, role }
        // We'll map 'role' to 'userType' and use 'username' for 'phoneNumber' or a new field.
        dispatch(setUser({
          id: response.user.id,
          // email: response.user.email, // If email is returned and needed
          username: response.user.username, // Or map to phoneNumber if that's what your slice expects
          userType: response.user.role, // 'user' or 'driver' or 'admin'
        }));
        
        // Navigate based on user type or to a general dashboard
        // This part might need adjustment based on your app's navigation structure
        if (response.user.role === 'driver') {
          router.replace('/(picker)'); // Assuming a route group for pickers
        } else if (response.user.role === 'user') {
          router.replace('/(user)'); // Assuming a route group for users
        } else {
          router.replace('/'); // Default route or admin dashboard
        }
      } else {
        setError(t('auth.invalidCredentials')); // Or use a more specific error from response if available
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.response?.data?.msg || err.message || t('auth.signInError'));
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
          <Text style={styles.label}>{t('auth.usernameOrPhone')}</Text>
          <View style={styles.phoneInputContainer}>
            {/* <TouchableOpacity style={styles.countryCodeContainer}>
              <Text style={styles.countryCode}>{countryCode}</Text>
            </TouchableOpacity> */}
            <TextInput
              style={styles.phoneInput} // Reuse style, or create new for username
              placeholder={t('auth.enterUsername')} // Or 'Enter phone number as username'
              placeholderTextColor={Colors.gray[400]}
              keyboardType="default" // Changed from phone-pad
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>{t('auth.password')}</Text>
          <View style={styles.phoneInputContainer}>
            <TextInput
              style={styles.phoneInput} // Reuse style, or create new for password
              placeholder={t('auth.enterPassword')}
              placeholderTextColor={Colors.gray[400]}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={goBack}
            >
              <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.continueButton, ((!username || !password) && styles.disabledButton)]}
              onPress={handleSignIn} // Changed from handleContinue
              disabled={!username || !password}
            >
              <Text style={styles.continueButtonText}>{t('auth.signInButton')}</Text>
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
    marginTop: '10%', // Adjusted margin
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
    marginBottom: spacing.lg, // Adjusted margin
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
    // marginRight: spacing.sm, // Removed if no icon
  },
  disabledButton: {
    backgroundColor: Colors.gray[400],
  },
  errorText: {
    color: Colors.danger.DEFAULT,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
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