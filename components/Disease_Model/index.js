import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ImageBackground, Alert, ScrollView, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import modelConfig from '../../config/modelConfig';

export default function Disease_Model() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
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
    
    // Set up navigation listener
    return () => {
      // Clean up function
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri) => {
    if (!imageUri) {
      Alert.alert('Missing Image', 'Please select an image');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });

    try {
      const url = `${modelConfig.getUrl("disease")}/diagnoseDisease`;
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrediction(response.data.diagnosis);
    } catch (error) {
      Alert.alert('Error', 'Error uploading image: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPhoto(null);
    setPrediction(null);
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setPhoto(photo.uri);
        setIsCameraOpen(false);
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
          <Text style={styles.title}>Disease Diagnosis</Text>
          
          {(image || photo) ? (
            <Image source={{ uri: photo || image }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.placeholderText}>No Image Selected</Text>
          )}
          
          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <Text style={styles.buttonText}>Take a Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          {/* Only show Diagnose button when an image is available */}
          {(photo || image) && (
            <TouchableOpacity
              style={[styles.buttonDiagnose, loading && styles.disabledButton]}
              onPress={() => uploadImage(photo || image)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Diagnose'}</Text>
              {loading && <ActivityIndicator size="small" color="#fff" />}
            </TouchableOpacity>
          )}
          
          {prediction && <Text style={styles.result}>Prediction: {prediction}</Text>}
          
          {prediction && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Disease_Solutions', { predictedDisease: prediction })}
            >
              <Text style={styles.buttonText}>View Solutions</Text>
            </TouchableOpacity>
          )}
          
          {/* Only show Reset button when there's something to reset */}
          {(photo || image || prediction) && (
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: 'black',
    fontWeight: 'bold',
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
  buttonDiagnose: {
    backgroundColor: 'lightblue',
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
    width: 300,
    height: 300,
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
  disabledButton: {
    backgroundColor: '#A9A9A9',
    opacity: 0.7,
  },
  result: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 10,
    textAlign: 'center',
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