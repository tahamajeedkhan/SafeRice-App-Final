import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import axios from 'axios';
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
      const url = `${config.getUrl("nutrition_extract_single_grain")}/analyze_rice`;
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      //console.log(response.data);
      setNutritionData(response.data);
      console.log(Object.entries(nutritionData));
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

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.backgroundImage}
      >
        <Text style={styles.title}>Nutrition Extractor</Text>
        {image || photo ? (
          <Image source={{ uri: photo || image }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.placeholderText}>No Image Selected</Text>
        )}
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

        {nutritionData && (
          <ScrollView style={styles.scrollArea}>
            {Object.entries(nutritionData).map(([key, value], index) => (
              <Text key={index} style={styles.result}>
                {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
              </Text>
            ))}
          </ScrollView>
        )}
        <TouchableOpacity style={styles.buttonReset} onPress={reset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
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
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  placeholderText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2a9d8f',
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  buttonDiagnose: {
    backgroundColor: '#e76f51',
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonReset: {
    backgroundColor: '#264653',
    padding: 10,
    marginTop: 15,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  result: {
    color: '#333',
    fontSize: 16,
    marginVertical: 2,
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
  scrollArea: {
    maxHeight: 200,
    marginTop: 10,
    paddingHorizontal: 10,
    width: '90%',
  },
});
