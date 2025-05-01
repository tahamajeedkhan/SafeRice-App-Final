import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, ImageBackground } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';

export default function Disease_Solutions() {
  const route = useRoute();
  const { predictedDisease } = route.params || {};
  const [diseaseData, setDiseaseData] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(predictedDisease || '');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [solution, setSolution] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDiseaseSolutions = async () => {
      try {
        const response = await axios.get('http://192.168.18.8:5001/getDiseaseSolutions');
        setDiseaseData(response.data);
        const dropdownItems = response.data.map((disease) => ({
          label: disease.name,
          value: disease.name,
        }));
        setItems(dropdownItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching disease data:', error);
        setLoading(false);
      }
    };

    fetchDiseaseSolutions();
  }, []);

  const showSolution = useCallback(() => {
    if (selectedDisease && diseaseData.length > 0) {
      const disease = diseaseData.find((d) => d.name === selectedDisease);
      if (disease) {
        setSolution(disease.solution);
      } else {
        setSolution('Solution not found for the selected disease.');
      }
    } else {
      setSolution('Please select a disease to view the solution.');
    }
  }, [selectedDisease, diseaseData]);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading diseases...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/background.png')} style={styles.backgroundImage}>
        <Text style={styles.title}>Disease Solution</Text>
        {predictedDisease ? (
          <View style={styles.predictedDiseaseContainer}>
            <Text style={styles.predictedText}>Predicted Disease:</Text>
            <Text style={styles.predictedDisease}>{predictedDisease}</Text>
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select a Disease:</Text>
            <DropDownPicker
              open={open}
              value={selectedDisease}
              items={items}
              setOpen={setOpen}
              setValue={setSelectedDisease}
              setItems={setItems}
              placeholder="Select a disease"
              style={styles.dropdown}
              dropDownStyle={styles.dropdownStyle}
              containerStyle={styles.dropdownContainer}
            />
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={showSolution}>
          <Text style={styles.buttonText}>Show Solution</Text>
        </TouchableOpacity>
        {solution && (
          <View style={styles.solutionContainer}>
            <Text style={styles.solutionText}>{solution}</Text>
          </View>
        )}
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: 'black',
    fontWeight: 'bold',
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  predictedDiseaseContainer: {
    backgroundColor: '#eafaf1',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  predictedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  predictedDisease: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 5,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 25,
    backgroundColor: 'transparent',
    margin: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    color: '#555',
    marginBottom: 12,
  },
  dropdown: {
    left: 25,
    width: '90%',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  dropdownStyle: {
    backgroundColor: 'transparent',
    borderRadius: 5,
  },
  dropdownContainer: {
    width: '90%',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: 'yellowgreen',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#90ee90',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
  },
  solutionContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'yellowgreen',
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  solutionText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});
