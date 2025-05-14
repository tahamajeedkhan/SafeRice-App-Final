import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Image, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config/apiConfig';

const { width, height } = Dimensions.get('window');

const MainMenu = ({ navigation }) => {
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reset navigation state when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Force layout update when screen is focused
      navigation.setParams({ refresh: Date.now() });
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUserId = await AsyncStorage.getItem('use_id');
        if (storedToken) setToken(storedToken);
        if (storedUserId) setUserId(storedUserId);
      } catch (error) {
        console.error('Error fetching token or userId:', error);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      const fetchUsername = async () => {
        try {
          setLoading(true);
          const url = `${config.getUrl("database")}/getUsername`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data.username) {
            setUsername(data.username);
          } else {
            Alert.alert('Error', data.message || 'Failed to fetch username');
          }
        } catch (error) {
          console.error('Error fetching username:', error);
          Alert.alert('Error', 'Failed to fetch username.');
        } finally {
          setLoading(false);
        }
      };
      fetchUsername();
    }
  }, [token]);

  const handleLogout = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is not available.');
      return;
    }
    try {
      const url = `${config.getUrl("database")}/logout`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.success) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('use_id');
        setUsername(null);
        setToken(null);
        setUserId(null);
        Alert.alert('Logged Out', 'You have been logged out.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Logout failed.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Menu options
  const menuOptions = [
    {
      id: 1,
      title: 'Rice Classification',
      image: require('../../assets/ricegrain.png'),
      navigateTo: 'Rice_Classification_Model',
    },
    {
      id: 2,
      title: 'Check Plant Disease',
      image: require('../../assets/plantdisease.png'),
      navigateTo: 'Disease_Model',
    },
    {
      id: 3,
      title: 'Check Plant Health',
      image: require('../../assets/planthealth.png'),
      navigateTo: 'Health_Model',
    },
    {
      id: 4,
      title: 'Disease Solutions',
      image: require('../../assets/plantsolution.png'),
      navigateTo: 'Disease_Solutions',
    },
    {
      id: 5,
      title: 'Nutrition Extraction',
      image: require('../../assets/nutrition.png'),
      navigateTo: 'Nutrition_Extraction',
    },
    {
      id: 6,
      title: 'Medicine',
      image: require('../../assets/medicine.png'),
      navigateTo: 'Medicine',
    },
    {
      id: 7,
      title: 'Cuisine Ideas',
      image: require('../../assets/cuisine.png'),
      navigateTo: 'Cuisine_Ideas',
    },
    {
      id: 8,
      title: 'Rice Grain Outlines',
      image: require('../../assets/grain_outline.png'),
      navigateTo: 'Outline_Grain',
    },
  ];

  // Create pairs of menu options for the grid layout
  const menuOptionPairs = [];
  for (let i = 0; i < menuOptions.length; i += 2) {
    if (i + 1 < menuOptions.length) {
      menuOptionPairs.push([menuOptions[i], menuOptions[i + 1]]);
    } else {
      menuOptionPairs.push([menuOptions[i]]);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF0000" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <ScrollView 
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Welcome, {username || 'User'}!</Text>
            
            <View style={styles.gridContainer}>
              {menuOptionPairs.map((pair, rowIndex) => (
                <View style={styles.row} key={rowIndex}>
                  {pair.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionBox}
                      onPress={() => navigation.navigate(option.navigateTo)}
                      activeOpacity={0.7}
                    >
                      <Image source={option.image} style={styles.optionImage} />
                      <Text style={styles.optionText}>{option.title}</Text>
                    </TouchableOpacity>
                  ))}
                  {pair.length === 1 && <View style={styles.emptySlot} />}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingBottom: 30, // More padding at the bottom for better scrolling
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 30,
    textAlign: 'center',
  },
  gridContainer: {
    width: '100%',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  optionBox: {
    backgroundColor: 'yellowgreen',
    borderRadius: 12,
    width: '47%',
    minHeight: Math.max(100, height * 0.12), // Responsive height based on device
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#3B7A57',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptySlot: {
    width: '47%',
  },
  optionImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
    borderRadius: 8,
  },
  optionText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  logoutText: {
    color: '#FF0000',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default MainMenu;