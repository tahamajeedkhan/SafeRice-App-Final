import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Image } from 'react-native';

const Outline_Grain = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  // Menu options for Nutrition Extraction screen
  const menuOptions = [
    {
      id: 1,
      title: 'Single Grain',
      image: require('../../assets/single_grain1.png'), // Update with your actual image
      navigateTo: 'Outline_Single_Grain', // Replace with your actual screen name
    },
    {
      id: 2,
      title: 'Multi Grain',
      image: require('../../assets/grain_outline.png'), // Update with your actual image
      navigateTo: 'Outline_Multi_Grain', // Replace with your actual screen name
    },
  ];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.backgroundImage}
      >
        <Text style={styles.title}>Outline Grain</Text>

        <View style={styles.gridContainer}>
          {Array.from({ length: 1 }).map((_, rowIndex) => (
            <View style={styles.row} key={rowIndex}>
              {menuOptions.map((option) => (
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
});

export default Outline_Grain;

