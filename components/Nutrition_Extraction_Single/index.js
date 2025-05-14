import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ImageBackground, Alert, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import config from '../../config/apiConfig';

export default function Nutrition_Extraction_Single() {
  const [image, setImage] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const checkPermissions = async () => {
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libraryStatus !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access the media library is required!');
      }
    };
    checkPermissions();
    
    // Clean up function
    return () => {
      if (!isCameraOpen) {
        StatusBar.setHidden(false);
      }
    };
  }, []);

  // Handle navigation options when camera state changes
  useEffect(() => {
    if (isCameraOpen) {
      StatusBar.setHidden(true);
      navigation.setOptions({
        headerShown: false,
      });
      // For bottom tabs - hide tab bar when camera is open
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });
    } else {
      StatusBar.setHidden(false);
      navigation.setOptions({
        headerShown: true,
      });
      // Restore tab bar
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined
      });
    }
  }, [isCameraOpen, navigation]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
      setPhoto(null); // Clear any previously taken photo
      setNutritionData(null); // Clear previous results
    }
  };

  const uploadImage = async (imageUri) => {
    if (!imageUri) {
      Alert.alert('Missing Image', 'Please select an image or take a photo first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'grain.jpg',
      type: 'image/jpeg',
    });

    try {
      const url = `${config.getUrl("nutrition_extract_single_grain")}/analyze_rice`;
      console.log(`Sending request to: ${url}`);
      
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log("Response received:", response.data);
      
      if (response.data && response.data.grains && response.data.grains.length > 0) {
        // Get the first grain from the array
        setNutritionData(response.data.grains[0]);
      } else {
        Alert.alert('No Data', 'No grain data returned from the server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      Alert.alert('Error', 'Failed to extract grain information: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    // Check if we already have permission, otherwise request it
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }
    }
    
    // Now open the camera
    setIsCameraOpen(true);
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          exif: false,
        });
        setPhoto(photo.uri);
        setImage(null); // Clear any previously selected image
        setIsCameraOpen(false);
        setNutritionData(null); // Clear previous results
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Camera Error', 'Failed to capture photo: ' + error.message);
        setIsCameraOpen(false);
      }
    }
  };

  const reset = () => {
    setImage(null);
    setPhoto(null);
    setNutritionData(null);
  };

  // Format a nutrition value with appropriate units
  const formatValue = (value, key) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (typeof value === 'number') {
      // Apply different formatting based on the key
      if (key.includes('length') || key.includes('width')) {
        return `${value.toFixed(2)} cm`;
      } else if (key.includes('volume')) {
        return `${value.toFixed(4)} cm³`;
      } else if (key.includes('weight')) {
        return `${value.toFixed(4)} g`;
      } else if (key.includes('calories')) {
        return `${value.toFixed(2)} kcal`;
      } else if (key.includes('protein') || key.includes('fat') || key.includes('carbs')) {
        return `${value.toFixed(2)} g`;
      }
      return `${value.toFixed(2)}`;
    }
    return String(value);
  };

  // Get a color based on the macro type for visual indicators
  const getMacroColor = (macroType) => {
    const colors = {
      protein: '#e63946', // Red
      carbs: '#457b9d', // Blue
      fat: '#f4a261', // Orange
      fiber: '#2a9d8f', // Teal
      sugar: '#e76f51', // Salmon
      calories: '#ffb703', // Yellow
      length: '#8338ec', // Purple
      width: '#3a86ff', // Bright blue
      volume: '#06d6a0', // Mint
      weight: '#fb5607', // Orange red
      default: '#2b2d42', // Dark blue-gray
    };
    
    const type = macroType.toLowerCase();
    if (type.includes('protein')) return colors.protein;
    if (type.includes('carb') || type.includes('carbohydrate')) return colors.carbs;
    if (type.includes('fat')) return colors.fat;
    if (type.includes('fiber')) return colors.fiber;
    if (type.includes('sugar')) return colors.sugar;
    if (type.includes('calories')) return colors.calories;
    if (type.includes('length')) return colors.length;
    if (type.includes('width')) return colors.width;
    if (type.includes('volume')) return colors.volume;
    if (type.includes('weight')) return colors.weight;
    
    return colors.default;
  };

  // Format a key for display (convert snake_case to Title Case)
  const formatKey = (key) => {
    return key.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Group nutrition data into logical categories for display
  const groupNutritionData = (data) => {
    if (!data) return {};
    
    const categories = {
      nutritional: [], // For protein, fat, carbs, calories
      physical: [],    // For physical properties
      other: []        // For other properties
    };
    
    Object.entries(data).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      
      // Skip rendering if value is null or undefined
      if (value === null || value === undefined) {
        return;
      }
      
      // Handle object values differently
      if (typeof value === 'object' && value !== null) {
        categories.other.push({ key, value });
        return;
      }
      
      // Categorize based on the type of property
      if (lowerKey === 'protein' || lowerKey === 'fat' || 
          lowerKey === 'carbs' || lowerKey === 'calories') {
        categories.nutritional.push({ key, value });
      } else if (lowerKey === 'length_cm' || lowerKey === 'width_cm' || 
                lowerKey === 'volume_cm3' || lowerKey === 'weight_g') {
        categories.physical.push({ key, value });
      } else {
        categories.other.push({ key, value });
      }
    });
    
    return categories;
  };

  // Render macro item with visual indicator bar
  const renderMacroItem = ({ key, value }) => {
    // Skip rendering if value is an object
    if (typeof value === 'object' && value !== null) {
      return null;
    }
    
    // Calculate percentage for visual bar
    let percentage = 0;
    let maxValue = 100; // Default max value
    
    if (typeof value === 'number') {
      if (key.includes('protein')) {
        maxValue = 30; // Max expected protein content in g
      } else if (key.includes('fat')) {
        maxValue = 20; // Max expected fat content in g
      } else if (key.includes('carbs')) {
        maxValue = 80; // Max expected carbs content in g
      } else if (key.includes('calories')) {
        maxValue = 500; // Max expected calories
      } else if (key.includes('volume')) {
        maxValue = 0.5; // Max expected volume in cm³
      } else if (key.includes('weight')) {
        maxValue = 0.1; // Max expected weight in g
      }
      
      percentage = Math.min((value / maxValue) * 100, 100);
    }
    
    const macroColor = getMacroColor(key);
    
    return (
      <View key={key} style={styles.macroItem}>
        <View style={styles.macroLabelContainer}>
          <Text style={styles.macroLabel}>{formatKey(key)}</Text>
          <Text style={styles.macroValue}>{formatValue(value, key)}</Text>
        </View>
        <View style={styles.macroBarContainer}>
          <View 
            style={[
              styles.macroBar, 
              { width: `${percentage}%`, backgroundColor: macroColor }
            ]} 
          />
        </View>
      </View>
    );
  };

  // Render complex object data (nested properties)
  const renderComplexData = (data) => {
    if (!data || typeof data !== 'object') {
      return null;
    }

    return (
      <View style={styles.infoBox}>
        {Object.entries(data).map(([key, value], idx) => (
          <View key={idx} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{formatKey(key)}:</Text>
            <Text style={styles.infoValue}>
              {typeof value === 'object' ? 'Complex data' : 
               typeof value === 'number' ? value.toFixed(2) : 
               String(value)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render the camera view when active
  if (isCameraOpen) {
    return (
      <View style={styles.fullScreenContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.cameraText}>Flip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.cameraButton, styles.captureButton]}
              onPress={takePhoto}
            >
              <Text style={styles.cameraText}>Capture</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => setIsCameraOpen(false)}
            >
              <Text style={styles.cameraText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // Main app view
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.backgroundImage}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Single Grain Nutrition Extractor</Text>
          
          {/* Image preview area */}
          {image || photo ? (
            <Image source={{ uri: photo || image }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.placeholderText}>No Image Selected</Text>
          )}
          
          {/* Action buttons */}
          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <Text style={styles.buttonText}>Take a Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          {/* Only show analyze button when image is available */}
          {(photo || image) && (
            <TouchableOpacity
              style={[styles.buttonAnalyze, loading && styles.disabledButton]}
              onPress={() => uploadImage(photo || image)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Analyzing...' : 'Analyze Grain'}</Text>
              {loading && <ActivityIndicator size="small" color="#fff" style={styles.loadingSpinner} />}
            </TouchableOpacity>
          )}

          {/* Results section */}
          {nutritionData && (
            <View style={styles.resultsContainer}>
              <Text style={styles.nutritionHeader}>Grain Analysis Results</Text>
              
              {/* Basic grain information */}
              <View style={styles.nutritionCard}>
                <Text style={styles.categoryTitle}>Grain Information</Text>
                {nutritionData.grain && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Grain ID:</Text>
                    <Text style={styles.infoValue}>{nutritionData.grain}</Text>
                  </View>
                )}
                {nutritionData.type && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Type:</Text>
                    <Text style={styles.infoValue}>{nutritionData.type}</Text>
                  </View>
                )}
              </View>
              
              {/* Nutritional information */}
              {groupNutritionData(nutritionData).nutritional.length > 0 && (
                <View style={styles.nutritionCard}>
                  <Text style={styles.categoryTitle}>Nutritional Information</Text>
                  {groupNutritionData(nutritionData).nutritional.map((item, index) => (
                    <React.Fragment key={`nutrition-${index}`}>
                      {renderMacroItem(item)}
                    </React.Fragment>
                  ))}
                </View>
              )}
              
              {/* Physical properties */}
              {groupNutritionData(nutritionData).physical.length > 0 && (
                <View style={styles.nutritionCard}>
                  <Text style={styles.categoryTitle}>Physical Properties</Text>
                  {groupNutritionData(nutritionData).physical.map((item, index) => (
                    <React.Fragment key={`physical-${index}`}>
                      {renderMacroItem(item)}
                    </React.Fragment>
                  ))}
                </View>
              )}
              
              {/* Other information */}
              {groupNutritionData(nutritionData).other.length > 0 && (
                <View style={styles.nutritionCard}>
                  <Text style={styles.categoryTitle}>Additional Information</Text>
                  
                  {groupNutritionData(nutritionData).other.map(({ key, value }, index) => {
                    if (typeof value === 'object' && value !== null) {
                      return (
                        <View key={`complex-${index}`} style={styles.additionalItem}>
                          <Text style={styles.additionalTitle}>{formatKey(key)}</Text>
                          {renderComplexData(value)}
                        </View>
                      );
                    } else {
                      return (
                        <React.Fragment key={`other-${index}`}>
                          {renderMacroItem({ key, value })}
                        </React.Fragment>
                      );
                    }
                  })}
                </View>
              )}
            </View>
          )}
          
          {/* Reset button */}
          {(image || photo || nutritionData) && (
            <TouchableOpacity style={styles.buttonReset} onPress={reset}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: 'black',
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'yellowgreen',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonAnalyze: {
    backgroundColor: 'lightblue',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonReset: {
    backgroundColor: 'lightcoral',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingSpinner: {
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
    opacity: 0.7,
  },
  // Camera styles
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  cameraButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  captureButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  cameraText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Results styles
  resultsContainer: {
    width: '90%',
    marginTop: 20,
  },
  nutritionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#264653',
  },
  nutritionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#2a9d8f',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#264653',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  macroItem: {
    marginBottom: 12,
  },
  macroLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  macroLabel: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  macroValue: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  macroBarContainer: {
    height: 10,
    backgroundColor: '#edf2f4',
    borderRadius: 5,
    overflow: 'hidden',
  },
  macroBar: {
    height: '100%',
    borderRadius: 5,
  },
  additionalItem: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  additionalTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#264653',
    fontSize: 15,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#457b9d',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    flex: 1,
    fontWeight: '500',
    color: '#555',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
});