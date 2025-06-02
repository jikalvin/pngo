import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes } from '@/constants/Layout';
import { ChevronRight } from 'lucide-react-native';

export default function UserTypeScreen() {
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
          <Text style={styles.title}>How would you like to use the app?</Text>
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
            <Text style={styles.buttonText}>Continue as User</Text>
            <View style={styles.buttonDescription}>
              <Text style={styles.buttonDescriptionText}>I want to send or receive packages</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigateToSignIn('picker')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue as Picker</Text>
            <View style={styles.buttonDescription}>
              <Text style={styles.buttonDescriptionText}>I want to deliver packages and earn</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpContainer}>
            <Text style={styles.helpText}>Need help? Contact Support</Text>
          </TouchableOpacity>

          <View style={styles.languageContainer}>
            <TouchableOpacity style={styles.languageButton}>
              <Text style={styles.languageButtonText}>ENGLISH</Text>
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