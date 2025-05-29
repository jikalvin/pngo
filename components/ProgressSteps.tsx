import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { spacing } from '@/constants/Layout';

interface ProgressStepsProps {
  totalSteps: number;
  currentStep: number;
}

export function ProgressSteps({ totalSteps, currentStep }: ProgressStepsProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i);
  
  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      <View style={styles.stepsContainer}>
        {steps.map((step) => (
          <View key={step} style={styles.stepWrapper}>
            <View 
              style={[
                styles.step,
                step <= currentStep ? styles.activeStep : null
              ]} 
            />
            {step < steps.length - 1 && (
              <View 
                style={[
                  styles.connector,
                  step < currentStep ? styles.activeConnector : null
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },
  activeStep: {
    backgroundColor: Colors.primary.DEFAULT,
  },
  connector: {
    height: 2,
    width: 50,
    backgroundColor: Colors.gray[300],
    marginHorizontal: spacing.xs,
  },
  activeConnector: {
    backgroundColor: Colors.primary.DEFAULT,
  },
});