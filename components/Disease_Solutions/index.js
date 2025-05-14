import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  ImageBackground,
  SafeAreaView,
  StatusBar
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import config from '../../config/apiConfig';

export default function DiseaseSolutions() {
  const route = useRoute();
  const navigation = useNavigation();
  const { predictedDisease } = route.params || {};
  
  const [diseaseData, setDiseaseData] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(predictedDisease || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [solution, setSolution] = useState('');

  // Convert disease data to dropdown items
  const dropdownItems = useMemo(() => {
    return diseaseData.map((disease) => ({
      label: disease.disease_name,
      value: disease.disease_name,
    }));
  }, [diseaseData]);

  // Fetch disease solutions from API
  useEffect(() => {
    const fetchDiseaseSolutions = async () => {
      try {
        const url = `${config.getUrl("database")}/getDiseaseSolutions`;
        const response = await axios.get(url);
        
        if (response.data && Array.isArray(response.data)) {
          setDiseaseData(response.data);
          setItems(response.data.map((disease) => ({
            label: disease.disease_name,
            value: disease.disease_name,
          })));
        } else {
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching disease data:', error);
        setError('Failed to load disease data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiseaseSolutions();
  }, []);

  // Auto-show solution when predicted disease is provided
  useEffect(() => {
    if (predictedDisease) {
      showSolution();
    }
  }, [predictedDisease, diseaseData]);

  const showSolution = useCallback(() => {
    if (!selectedDisease) {
      setSolution('Please select a disease to view the solution.');
      return;
    }

    if (diseaseData.length > 0) {
      const disease = diseaseData.find((d) => d.disease_name === selectedDisease);
      if (disease) {
        setSolution(disease.solution);
      } else {
        setSolution('Solution not found for the selected disease.');
      }
    }
  }, [selectedDisease, diseaseData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#7CB518" />
          <Text style={styles.loadingText}>Loading disease information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={[styles.button, styles.errorButton]} 
            onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <ImageBackground 
          source={require('../../assets/background.png')} 
          style={styles.backgroundImage}
          resizeMode="cover">
          
          <View style={styles.contentContainer}>
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
                  dropDownContainerStyle={styles.dropdownListContainer}
                  placeholderStyle={styles.placeholderStyle}
                  listItemLabelStyle={styles.listItemLabel}
                  zIndex={1000}
                />
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={showSolution}
              activeOpacity={0.8}>
              <Text style={styles.buttonText}>Show Solution</Text>
            </TouchableOpacity>
            
            {solution && (
              <View style={styles.solutionContainer}>
                <Text style={styles.solutionTitle}>Recommended Treatment:</Text>
                <Text style={styles.solutionText}>{solution}</Text>
              </View>
            )}
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 30,
    color: '#333333',
  },
  predictedDiseaseContainer: {
    backgroundColor: '#F5F9F0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E8D5',
  },
  predictedText: {
    fontSize: 16,
    color: '#6B8E23',
    fontWeight: '600',
  },
  predictedDisease: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginTop: 8,
    textAlign: 'center',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 25,
    zIndex: 1000,
  },
  label: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 12,
    fontWeight: '500',
  },
  dropdown: {
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  dropdownListContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
    borderRadius: 8,
  },
  placeholderStyle: {
    color: '#888888',
  },
  listItemLabel: {
    color: '#333333',
  },
  button: {
    backgroundColor: '#9DC229',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 300,
    shadowColor: '#90EE90',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  solutionContainer: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#F5F9F0',
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E8D5',
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B8E23',
    marginBottom: 10,
    textAlign: 'center',
  },
  solutionText: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555555',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#9DC229',
    marginTop: 15,
  },
});