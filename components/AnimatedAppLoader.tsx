// components/AnimatedAppLoader.tsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Colors from '../constants/Colors'; // Adjusted path assuming components/ and constants/ are siblings

const AnimatedAppLoader = ({ size = 150 }: { size?: number }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/splash.gif')} // Path relative to this file
        style={{ width: size, height: size }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default AnimatedAppLoader;
