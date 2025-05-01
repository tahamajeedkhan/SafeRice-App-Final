import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SplashScreenComponent = ({ navigation }) => {
  useEffect(() => {
    // Navigate to Login after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Login'); // Navigate to the Login screen
    }, 3000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf0e6', // Background color for splash screen
  },
  logo: {
    width: 350,
    height: 350,
    marginBottom: 10,
  },
});

export default SplashScreenComponent;
