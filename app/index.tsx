import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    // Show splash for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (showSplash) {
    return (
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/splash.gif')}
          style={styles.splash}
          resizeMode="contain"
        />
      </View>
    );
  }
  
  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splash: {
    width: '100%',
    height: '100%',
  },
});