import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes } from '@/constants/Layout';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { registerUser, loginUser } from '@/utils/api'; // Import both
import * as AuthStorage from '@/utils/authStorage';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setUser } from '@/store/authSlice';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { userType } = useLocalSearchParams<{ userType: 'user' | 'driver' | 'admin' }>(); // Get userType from route

  const handleSignUp = async () => {
    if (!username || !password || !confirmPassword) {
      setError(t('auth.fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }
    if (!userType) {
      setError(t('auth.userTypeMissing')); // Should not happen if navigation is correct
      return;
    }
    setError('');

    try {
      const registrationResponse = await registerUser(username, password, userType);
      Alert.alert(
        t('auth.registrationSuccessTitle'),
        registrationResponse.msg || t('auth.registrationSuccessMessage'),
        [
          {
            text: t('common.ok'),
            onPress: async () => {
              // Option 1: Navigate to Sign In
              router.replace('/onboarding/sign-in');
              
              // Option 2: Auto-login (More seamless UX)
              // const loginResponse = await loginUser(username, password);
              // if (loginResponse.token && loginResponse.user) {
              //   await AuthStorage.storeToken(loginResponse.token);
              //   await AuthStorage.storeUserData(loginResponse.user);
              //   dispatch(setAuthenticated(true));
              //   dispatch(setUser({
              //     id: loginResponse.user.id,
              //     username: loginResponse.user.username,
              //     userType: loginResponse.user.role,
              //   }));
              //   if (loginResponse.user.role === 'driver') {
              //     router.replace('/(picker)');
              //   } else if (loginResponse.user.role === 'user') {
              //     router.replace('/(user)');
              //   } else {
              //     router.replace('/');
              //   }
              // } else {
              //    setError(t('auth.autoLoginFailed'));
              //    router.replace('/onboarding/sign-in');
              // }
            },
          },
        ]
      );
    } catch (err: any) {
      console.error("Sign-up error:", err);
      setError(err.response?.data?.msg || err.message || t('auth.signUpError'));
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
          <Text style={styles.title}>{t('auth.signUpTitle')} ({userType === 'driver' ? t('auth.asPicker') : t('auth.asUser')})</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.duration(800).delay(500)}
          style={styles.formContainer}
        >
          <Text style={styles.label}>{t('auth.username')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterUsername')}
              placeholderTextColor={Colors.gray[400]}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>{t('auth.password')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterPassword')}
              placeholderTextColor={Colors.gray[400]}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('auth.enterConfirmPassword')}
              placeholderTextColor={Colors.gray[400]}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <ChevronLeft size={24} color={Colors.primary.DEFAULT} />
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, (!username || !password || !confirmPassword) && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={!username || !password || !confirmPassword}
            >
              <Text style={styles.actionButtonText}>{t('auth.signUpButton')}</Text>
              <ChevronRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={() => router.replace('/onboarding/sign-in')} style={styles.signInLink}>
            <Text style={styles.signInLinkText}>{t('auth.alreadyHaveAccount')}</Text>
          </TouchableOpacity>

        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// Add styles, similar to sign-in but potentially with adjustments
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  backgroundImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  gradient: { ...StyleSheet.absoluteFillObject, height: '100%' },
  content: { flex: 1, padding: spacing.lg },
  headerContainer: { marginTop: '10%', alignItems: 'center' },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSizes.xl, // Adjusted size
    color: Colors.primary.DEFAULT,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  formContainer: { marginTop: '10%', alignItems: 'center' },
  label: {
    alignSelf: 'flex-start',
    fontFamily: 'Poppins-Medium',
    fontSize: fontSizes.sm,
    color: Colors.primary.DEFAULT,
    marginBottom: spacing.xs, // Smaller margin
    marginLeft: spacing.sm, // Indent label slightly
  },
  inputContainer: { // Renamed from phoneInputContainer for clarity
    backgroundColor: Colors.primary[100],
    borderRadius: 8,
    width: '100%',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md, // Adjusted margin
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { // Renamed from phoneInput for clarity
    flex: 1,
    paddingVertical: spacing.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.md,
    color: Colors.gray[800],
  },
  buttonRow: { // Renamed from buttonContainer
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.lg, // Adjusted margin
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
  actionButton: { // Renamed from continueButton
    flexDirection: 'row',
    backgroundColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: { // Renamed from continueButtonText
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    fontSize: fontSizes.sm,
    marginRight: spacing.sm,
  },
  disabledButton: { backgroundColor: Colors.gray[400] },
  errorText: {
    color: Colors.danger.DEFAULT,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  signInLink: { marginTop: spacing.xl },
  signInLinkText: {
    fontFamily: 'Poppins-Medium',
    color: Colors.primary.DEFAULT,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
});
