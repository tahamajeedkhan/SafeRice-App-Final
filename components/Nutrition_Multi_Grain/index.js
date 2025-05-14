import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ImageBackground, ScrollView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import config from '../../config/apiConfig';

export default function Nutrition_Extraction_Multi() {
  const [image, setImage] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri) => {
    if (!imageUri) {
      alert('Please select an image');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'nutrition.jpg',
      type: 'image/jpeg',
    });

    try {
      const url = `${config.getUrl("nutrition_extract_multi_grain")}/classify_grains`;
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNutritionData(response.data);
    } catch (error) {
      alert('Failed to extract nutrition information');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo.uri);
      setIsCameraOpen(false);
      uploadImage(photo.uri);
    }
  };

  const reset = () => {
    setImage(null);
    setPhoto(null);
    setNutritionData(null);
  };

  // Format a nutrition value with units
  const formatValue = (value) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}g`;
    }
    return value;
  };

  // Get a color based on the macro type
  const getMacroColor = (macroType) => {
    const colors = {
      protein: '#e63946', // Red
      carbs: '#457b9d', // Blue
      fats: '#f4a261', // Orange
      fiber: '#2a9d8f', // Teal
      sugar: '#e76f51', // Salmon
      calories: '#ffb703', // Yellow
      default: '#2b2d42', // Dark blue-gray
    };
    
    const type = macroType.toLowerCase();
    if (type.includes('protein')) return colors.protein;
    if (type.includes('carb') || type.includes('carbohydrate')) return colors.carbs;
    if (type.includes('fat')) return colors.fats;
    if (type.includes('fiber')) return colors.fiber;
    if (type.includes('sugar')) return colors.sugar;
    if (type.includes('calorie')) return colors.calories;
    
    return colors.default;
  };

  // Format a key for display
  const formatKey = (key) => {
    return key.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isCameraOpen) {
    return (
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraControls}>
          <TouchableOpacity onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}>
            <Text style={styles.cameraText}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto}>
            <Text style={styles.cameraText}>Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsCameraOpen(false)}>
            <Text style={styles.cameraText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    );
  }

  // Group nutrition data into categories
  const groupNutritionData = (data) => {
    if (!data) return {};
    
    const categories = {
      vitamins: [],
      minerals: [],
      other: []
    };
    
    Object.entries(data).forEach(([key, value]) => {
      // Skip non-numeric values or complex objects
      if (typeof value !== 'number' && typeof value !== 'string') {
        categories.other.push({ key, value });
        return;
      }
      
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('vitamin')) {
        categories.vitamins.push({ key, value });
      } else if (lowerKey.includes('calcium') || lowerKey.includes('iron') || 
                lowerKey.includes('sodium') || lowerKey.includes('potassium') ||
                lowerKey.includes('zinc') || lowerKey.includes('magnesium')) {
        categories.minerals.push({ key, value });
      } else {
        categories.other.push({ key, value });
      }
    });
    
    return categories;
  };

  // Render macro item with visual bar
  const renderMacroItem = ({ key, value }) => {
    // Calculate percentage for visual bar (assuming max of 100g)
    const percentage = typeof value === 'number' ? Math.min(value, 100) : 0;
    const macroColor = getMacroColor(key);
    
    return (
      <View key={key} style={styles.macroItem}>
        <View style={styles.macroLabelContainer}>
          <Text style={styles.macroLabel}>{formatKey(key)}</Text>
          <Text style={styles.macroValue}>{formatValue(value)}</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={require('../../assets/background.png')}
          style={styles.backgroundImage}
        >
          <Text style={styles.title}>Multi Grain Nutrition Extractor</Text>
          
          {image || photo ? (
            <Image source={{ uri: photo || image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>No Image Selected</Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setIsCameraOpen(true)}>
              <Text style={styles.buttonText}>Take a Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.buttonDiagnose, loading && styles.disabledButton]}
              onPress={() => uploadImage(photo || image)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Extracting...' : 'Extract Nutrition'}</Text>
              {loading && <ActivityIndicator size="small" color="#fff" />}
            </TouchableOpacity>
          </View>

          {nutritionData && (
            <View style={styles.resultsContainer}>
              <Text style={styles.nutritionHeader}>Nutrition Information</Text>
              
              {/* Vitamins in a card if available */}
              {groupNutritionData(nutritionData).vitamins.length > 0 && (
                <View style={styles.nutritionCard}>
                  <Text style={styles.categoryTitle}>Vitamins</Text>
                  {groupNutritionData(nutritionData).vitamins.map(item => renderMacroItem(item))}
                </View>
              )}
              
              {/* Minerals in a card if available */}
              {groupNutritionData(nutritionData).minerals.length > 0 && (
                <View style={styles.nutritionCard}>
                  <Text style={styles.categoryTitle}>Minerals</Text>
                  {groupNutritionData(nutritionData).minerals.map(item => renderMacroItem(item))}
                </View>
              )}
              
              {/* Other nutrients in a card if available */}
              {groupNutritionData(nutritionData).other.length > 0 && (
                <View style={styles.nutritionCard}>
                  
                  {groupNutritionData(nutritionData).other.map(({ key, value }, index) => {
                    if (typeof value === 'object' && value !== null) {
                      return (
                        <View key={`complex-${index}`} style={styles.additionalItem}>
                          <Text style={styles.additionalTitle}>{formatKey(key)}</Text>
                          <View style={styles.infoBox}>
                            {Object.entries(value).map(([subKey, subValue], idx) => (
                              <View key={idx} style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{formatKey(subKey)}:</Text>
                                <Text style={styles.infoValue}>
                                  {typeof subValue === 'number' ? subValue.toFixed(1) : subValue}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    } else {
                      return renderMacroItem({ key, value });
                    }
                  })}
                </View>
              )}
            </View>
          )}
          
          <TouchableOpacity style={styles.buttonReset} onPress={reset}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    minHeight: '100%',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  imagePlaceholder: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  buttonContainer: {
    width: '90%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2a9d8f',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonDiagnose: {
    backgroundColor: '#e76f51',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonReset: {
    backgroundColor: '#264653',
    padding: 12,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  cameraText: {
    color: '#fff',
    fontSize: 18,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
  },
  resultsContainer: {
    width: '90%',
    marginTop: 20,
  },
  // Styled nutrition cards
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
    paddingVertical: 3,
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