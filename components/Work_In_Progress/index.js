import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';

const Work_In_Progress = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.backgroundImage}
      >
      <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
      <Text style={styles.title}>Work in Progress</Text>
      <Text style={styles.subtitle}>This feature is under construction. Please check back later!</Text>
      </ImageBackground>
    </View>
  );
};

// Styles for the screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  backgroundImage: {
    flex: 1,
    alignItems: 'center',
  },
  spinner: {
    marginTop: "50%",
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});

export default Work_In_Progress;
