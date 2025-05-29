import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import Layout, { spacing, fontSizes, lineHeights } from '@/constants/Layout';
import { ChevronRight } from 'lucide-react-native';

export default function OnboardingScreen() {
  const navigateToUserTypeSelection = () => {
    router.push('/onboarding/user-type');
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
          <Text style={styles.title}>Welcome to PiknGo</Text>
          <Text style={styles.subtitle}>Get Your Packages Delivered Fast & Securely with PiknGo!</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.duration(800).delay(600)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={navigateToUserTypeSelection}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>CONTINUE</Text>
            <ChevronRight size={20} color={Colors.white} />
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
    marginTop: '60%',
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
    fontSize: fontSizes.md,
    color: Colors.white,
    textAlign: 'center',
    marginHorizontal: spacing.xl,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.DEFAULT,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    fontSize: fontSizes.md,
    marginRight: spacing.sm,
  },
  helpContainer: {
    marginTop: spacing.xl * 2,
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