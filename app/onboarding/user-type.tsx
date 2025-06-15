import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes } from '@/constants/Layout';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next'; // Added import

export default function UserTypeScreen() {
  const { t } = useTranslation(); // Initialized t

  const navigateToSignIn = (userType: 'user' | 'picker') => {
    // Store the user type in the auth state or local storage
    // This will be used later to determine which tabs to show
    router.push({
      pathname: '/onboarding/sign-in',
      params: { userType }
    });
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
          style={styles.titleContainer}
        >
          <Text style={styles.title}>{t('onboarding.userTypePrompt')}</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.duration(800).delay(600)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigateToSignIn('user')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('onboarding.continueAsUser')}</Text>
            <View style={styles.buttonDescription}>
              <Text style={styles.buttonDescriptionText}>{t('onboarding.userDescription')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigateToSignIn('picker')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('onboarding.continueAsPicker')}</Text>
            <View style={styles.buttonDescription}>
              <Text style={styles.buttonDescriptionText}>{t('onboarding.pickerDescription')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpContainer}>
            <Text style={styles.helpText}>{t('common.needHelp')}</Text>
          </TouchableOpacity>

          <View style={styles.languageContainer}>
            <TouchableOpacity style={styles.languageButton}>
              {/* Assuming a language switcher might be more complex, for now, hardcoding or using a specific key */}
              <Text style={styles.languageButtonText}>{t('common.languageEnglish')}</Text>
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
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  titleContainer: {
    marginTop: '30%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSizes.xl,
    color: Colors.primary.DEFAULT,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  buttonDescription: {
    backgroundColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  buttonDescriptionText: {
    fontFamily: 'Poppins-Regular',
    color: Colors.white,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: spacing.xl,
  },
  helpText: {
    fontFamily: 'Poppins-Regular',
    color: Colors.white,
    fontSize: fontSizes.sm,
  },
  languageContainer: {
    marginTop: spacing.lg,
  },
  languageButton: {
    borderWidth: 1,
    borderColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 4,
  },
  languageButtonText: {
    fontFamily: 'Poppins-Medium',
    color: Colors.primary.DEFAULT,
    fontSize: fontSizes.sm,
  },
});