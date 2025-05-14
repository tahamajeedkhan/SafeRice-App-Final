import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  ImageBackground,
  StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import modelConfig from '../../config/modelConfig';
import config from '../../config/apiConfig';

export default function Outline_Multi_Grain() {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [outlinedImage, setOutlinedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
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
      // For bottom tabs - this is the correct way to hide tab bar in newer React Navigation
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
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const analyzeImage = async (imageUri) => {
    setLoading(true);
    setResults(null);
    setOutlinedImage(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });

      const url = `${config.getUrl("outline_Multi_Grain")}/analyze`;
      const response = await fetch(`${url}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      
      // Set results and image
      setResults(data);
      if (data.outlined_image) {
        setOutlinedImage(`data:image/jpeg;base64,${data.outlined_image}`);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Analysis Error', error.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResults(null);
    setOutlinedImage(null);
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setImage(photo.uri);
        setIsCameraOpen(false);
        analyzeImage(photo.uri);
      } catch (error) {
        Alert.alert('Camera Error', 'Failed to take photo: ' + (error.message || 'Unknown error'));
        setIsCameraOpen(false);
      }
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

  // Render the camera when it's open
  if (isCameraOpen) {
    return (
      <View style={styles.fullScreenContainer}>
        <CameraView 
          style={styles.camera} 
          facing={facing} 
          ref={cameraRef}
        >
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

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../assets/background.png')} style={styles.backgroundImage}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Multi Grains Outliner</Text>
          
          {(image || outlinedImage) ? (
            <Image source={{ uri: outlinedImage || image }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.placeholderText}>No Image Selected</Text>
          )}
          
          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <Text style={styles.buttonText}>Take a Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B7A57" />
              <Text style={styles.loadingText}>Outlining rice grains...</Text>
            </View>
          )}
          
          {results && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Analysis Results</Text>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Grain Count:</Text>
                <Text style={styles.resultValue}>{results.grain_count}</Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Grain Type:</Text>
                <Text style={styles.resultValue}>{results.grain_type}</Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Aspect Ratio:</Text>
                <Text style={styles.resultValue}>{results.aspect_ratio}</Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Estimated Weight:</Text>
                <Text style={styles.resultValue}>{results.total_weight}g</Text>
              </View>
            </View>
          )}
          
          {/* Only show Reset button when there's something to reset */}
          {(image || results || outlinedImage) && (
            <TouchableOpacity 
              style={styles.buttonReset}
              onPress={reset}
            >
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: 'black',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3B7A57',
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 15,
    width: '80%',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3B7A57',
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resultLabel: {
    fontWeight: '600',
    color: '#333',
  },
  resultValue: {
    color: '#333',
  },
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
});