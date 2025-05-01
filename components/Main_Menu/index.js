import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config/apiConfig';

const MainMenu = ({ navigation }) => {
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

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
      navigateTo: 'Work_In_Progress',
    },
  ];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.backgroundImage}
      >
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF0000" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome, {username || 'User'}!</Text>

        <View style={styles.gridContainer}>
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <View style={styles.row} key={rowIndex}>
              {menuOptions.slice(rowIndex * 2, rowIndex * 2 + 2).map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionBox}
                  onPress={() => navigation.navigate(option.navigateTo)}
                >
                  <Image source={option.image} style={styles.optionImage} />
                  <Text style={styles.optionText}>{option.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 30,
    textAlign: 'center',
  },
  gridContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionBox: {
    backgroundColor: 'yellowgreen',
    borderRadius: 12,
    width: '48%', // Updated to 48% for 2 per row
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#3B7A57',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF0000',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default MainMenu;
