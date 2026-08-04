import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { scannerService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme';
const ImageRecognitionScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const takePhoto = async () => {
    const {
      status
    } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }
    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;
      setImage(uri);
      analyzeImage(uri);
    }
  };
  const analyzeImage = async uri => {
    setAnalyzing(true);
    setResult(null);
    try {
      const userData = await AsyncStorage.getItem('userData');
      const userId = userData ? JSON.parse(userData).user_id || 1 : 1;
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      formData.append('file', {
        uri,
        name: filename,
        type
      });
      const response = await scannerService.analyzeImage(userId, formData);
      if (response.data) {
        setResult(response.data);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };
  return <SafeAreaView style={styles.container}>
      <View style={styles.cameraView}>
        {image ? <Image source={{
        uri: image
      }} style={styles.previewImage} /> : <View style={styles.placeholderBox}>
             <Text style={styles.placeholderText}>{t("ImageRecognitionScreen.No_photo_taken")}</Text>
          </View>}
      </View>

      <View style={styles.results}>
        {analyzing ? <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={styles.loadingText}>{t("ImageRecognitionScreen.Analyzing_food")}</Text>
          </View> : result ? <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.resultTitle}>{t("ImageRecognitionScreen.Analysis_Complete")}</Text>
            
            <View style={styles.itemCard}>
              <Text style={styles.itemEmoji}>🍽️</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{result.food_name || 'Unknown Food'}</Text>
                <Text style={styles.itemConfidence}>{t("ImageRecognitionScreen.Confidence")}{Math.round((result.confidence || 0) * 100)}%</Text>
              </View>
            </View>

            {/* Nutrition */}
            <Text style={styles.sectionTitle}>{t("ImageRecognitionScreen.Nutrition_Information")}</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroBox}><Text style={styles.macroVal}>{result.nutrition?.calories || result.calories || 0}</Text><Text style={styles.macroLbl}>{t("ImageRecognitionScreen.Calories")}</Text></View>
              <View style={styles.macroBox}><Text style={styles.macroVal}>{result.nutrition?.protein || result.protein || 0}{t("ImageRecognitionScreen.g")}</Text><Text style={styles.macroLbl}>{t("ImageRecognitionScreen.Protein")}</Text></View>
              <View style={styles.macroBox}><Text style={styles.macroVal}>{result.nutrition?.carbs || result.carbs || 0}{t("ImageRecognitionScreen.g")}</Text><Text style={styles.macroLbl}>{t("ImageRecognitionScreen.Carbs")}</Text></View>
              <View style={styles.macroBox}><Text style={styles.macroVal}>{result.nutrition?.fat || result.fat || 0}{t("ImageRecognitionScreen.g")}</Text><Text style={styles.macroLbl}>{t("ImageRecognitionScreen.Fats")}</Text></View>
            </View>

            {/* Preparation Steps */}
            {(result.cooking_suggestions || result.making_process) && <>
                 <Text style={styles.sectionTitle}>{t("ImageRecognitionScreen.Preparation_Steps")}</Text>
                 <View style={styles.prepBox}>
                   <Text style={styles.prepText}>
                     {Array.isArray(result.cooking_suggestions) ? result.cooking_suggestions.join('\n') : result.making_process || 'No steps available.'}
                   </Text>
                 </View>
               </>}

            <TouchableOpacity style={styles.confirmButton} onPress={() => {
          navigation.goBack();
        }}>
              <Text style={styles.confirmButtonText}>{t("ImageRecognitionScreen.Done")}</Text>
            </TouchableOpacity>
          </ScrollView> : <View style={styles.actionBox}>
            <Text style={styles.resultTitle}>{t("ImageRecognitionScreen.Scan_Food_Item")}</Text>
            <Text style={styles.descText}>{t("ImageRecognitionScreen.Take_a_photo_of_your_food_to_i")}</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={takePhoto}>
              <Text style={styles.confirmButtonText}>{t("ImageRecognitionScreen.Take_Photo")}</Text>
            </TouchableOpacity>
          </View>}
      </View>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white
  },
  cameraView: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    color: '#666',
    fontSize: 16
  },
  results: {
    height: '75%',
    padding: 24,
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Theme.colors.textMuted
  },
  actionBox: {
    flex: 1,
    justifyContent: 'center'
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 16
  },
  descText: {
    fontSize: 15,
    color: Theme.colors.textMuted,
    marginBottom: 24,
    lineHeight: 22
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Theme.colors.card,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  itemEmoji: {
    fontSize: 32,
    marginRight: 16
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text
  },
  itemConfidence: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 12
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  macroBox: {
    backgroundColor: Theme.colors.card,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '23%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  macroVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text
  },
  macroLbl: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 4
  },
  prepBox: {
    backgroundColor: Theme.colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24
  },
  prepText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24
  },
  confirmButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  confirmButtonText: {
    color: Theme.colors.card,
    fontSize: 16,
    fontWeight: 'bold'
  }
});
export default ImageRecognitionScreen;