import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme';
import { Camera as CameraIcon, Image as ImageIcon, Zap, ChevronLeft, Sparkles, Scan } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { scannerService } from '../services/api';
const {
  width
} = Dimensions.get('window');
const BarcodeScannerScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [userId, setUserId] = useState(1);

  // Laser animation line
  const laserAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const init = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.user_id || 1);
        }
      } catch (e) {}
    };
    init();

    // Laser loop
    Animated.loop(Animated.sequence([Animated.timing(laserAnim, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: true
    }), Animated.timing(laserAnim, {
      toValue: 0,
      duration: 1800,
      useNativeDriver: true
    })])).start();
  }, []);
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow camera access to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
      setActiveTab(null);
    }
  };
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
      setActiveTab(null);
    }
  };
  const handleAnalyze = async () => {
    if (!image) {
      Alert.alert("No Image", "Please take a photo or upload an image first.");
      return;
    }
    setLoading(true);
    setResult(null);
    setActiveTab(null);
    const fileName = image.split('/').pop() || 'food.jpg';
    const formData = new FormData();
    formData.append('file', {
      uri: image,
      name: fileName,
      type: 'image/jpeg'
    });
    let attempts = 0;
    let lastError = null;
    try {
      while (attempts < 2) {
        attempts += 1;
        try {
          console.log(`Analyze attempt ${attempts} for URI:`, image);
          const response = await scannerService.analyzeImage(userId, formData);
          const data = response?.data;
          if (!data) {
            throw new Error('No analysis data returned from server.');
          }
          setResult(data);
          if (data.status === 'success' || data.status === 'mock') {
            console.log('Scan saved with ID:', data.id);
            navigation.navigate('FoodDetails', {
              food: data
            });
          }
          return;
        } catch (error) {
          lastError = error;
          console.warn(`Analyzer attempt ${attempts} failed`, error);
          if (attempts >= 2) {
            throw error;
          }
        }
      }
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || "Gemini AI failed to analyze this image. Please try again.";
      Alert.alert("Analysis Failed", msg, [{
        text: "Cancel",
        style: "cancel"
      }, {
        text: "Retry",
        onPress: handleAnalyze
      }]);
    } finally {
      setLoading(false);
    }
  };
  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240]
  });
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={22} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("BarcodeScannerScreen.AI_Food_Scanner")}</Text>
          <View style={{
          width: 40
        }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Camera Frame Preview Container */}
          <View style={styles.imageContainer}>
            {image ? <View style={{
            flex: 1,
            position: 'relative'
          }}>
                <Image source={{
              uri: image
            }} style={styles.previewImage} />

                {/* Animated Laser Scanning Overlay */}
                <View style={styles.scanOverlay}>
                  <View style={[styles.cornerBracket, styles.bracketTL]} />
                  <View style={[styles.cornerBracket, styles.bracketTR]} />
                  <View style={[styles.cornerBracket, styles.bracketBL]} />
                  <View style={[styles.cornerBracket, styles.bracketBR]} />

                  <Animated.View style={[styles.laserLine, {
                transform: [{
                  translateY: laserTranslateY
                }]
              }]} />
                </View>
              </View> : <View style={styles.placeholderBox}>
                <View style={styles.placeholderIconWrap}>
                  <Scan size={44} color={Theme.colors.primary} />
                </View>
                <Text style={styles.placeholderTitle}>{t("BarcodeScannerScreen.Snap_or_Upload_Food")}</Text>
                <Text style={styles.placeholderText}>{t("BarcodeScannerScreen.AI_automatically_detects_food")}</Text>
              </View>}
          </View>

          {/* Action Row */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={takePhoto} activeOpacity={0.8}>
              <View style={styles.controlIconWrap}>
                <CameraIcon size={22} color={Theme.colors.primary} />
              </View>
              <Text style={styles.controlBtnText}>{t("BarcodeScannerScreen.Take_Photo")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={pickImage} activeOpacity={0.8}>
              <View style={[styles.controlIconWrap, {
              backgroundColor: 'transparent'
            }]}>
                <ImageIcon size={22} color={Theme.colors.primary} />
              </View>
              <Text style={styles.controlBtnText}>{t("BarcodeScannerScreen.Upload_Image")}</Text>
            </TouchableOpacity>
          </View>

          {/* Analyze Button */}
          <TouchableOpacity style={[styles.analyzeBtnWrapper, (!image || loading) && styles.disabledBtn]} onPress={handleAnalyze} disabled={loading || !image} activeOpacity={0.88}>
            <LinearGradient colors={Theme.gradients.primary} style={styles.analyzeBtnGrad} start={{
            x: 0,
            y: 0
          }} end={{
            x: 1,
            y: 0
          }}>
              {loading ? <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFF" size="small" />
                  <Text style={styles.analyzeBtnText}>{t("BarcodeScannerScreen.AI_Analyzing_Food")}</Text>
                </View> : <>
                  <Zap size={20} color="#FFF" fill="#FFF" />
                  <Text style={styles.analyzeBtnText}>{result ? "Re-Analyze Food" : "Analyze Food with AI"}</Text>
                </>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  gradient: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xs
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.primary
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 110
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    ...Theme.shadows.md,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Theme.colors.primary,
    strokeWidth: 3
  },
  bracketTL: {
    top: 16,
    left: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6
  },
  bracketTR: {
    top: 16,
    right: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6
  },
  bracketBL: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6
  },
  bracketBR: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6
  },
  laserLine: {
    width: '100%',
    height: 3,
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4
  },
  placeholderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8
  },
  placeholderIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  placeholderTitle: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.primary
  },
  placeholderText: {
    textAlign: 'center',
    color: Theme.colors.primary,
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.body,
    lineHeight: 20
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 14
  },
  controlBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    gap: 8
  },
  controlIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  controlBtnText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: Theme.colors.primary
  },
  analyzeBtnWrapper: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    ...Theme.shadows.md
  },
  analyzeBtnGrad: {
    flexDirection: 'row',
    height: 56,
    borderRadius: Theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  analyzeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  disabledBtn: {
    opacity: 0.55
  }
});
export default BarcodeScannerScreen;