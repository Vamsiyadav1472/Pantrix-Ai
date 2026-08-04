import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, Dimensions, Image } from 'react-native';
import { Theme } from '../theme';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const OnboardingScreen2 = ({ navigation }) => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <LinearGradient 
        colors={Theme.gradients.background}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />

        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <Sparkles size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.brandText}>{t("OnboardingScreen2.PantrixAI", { defaultValue: 'PantrixAI' })}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={styles.skipText}>{t("OnboardingScreen2.Skip", { defaultValue: 'Skip' })}</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={[styles.illustrationWrap, { transform: [{ scale: scaleAnim }] }]}>
              <Image source={require('./flat_onboarding2_img.png')} style={styles.image} resizeMode="contain" />
            </Animated.View>

            <View style={styles.glassCard}>
              <Text style={styles.title}>{t("OnboardingScreen2.Smart_Pantry_Management", { defaultValue: 'Smart Pantry Management' })}</Text>
              <Text style={styles.subtitle}>{t("OnboardingScreen2.Organize_your_pantry_track_ex", { defaultValue: 'Organize your pantry, track expiry dates, and never waste food again.' })}</Text>
              
              <View style={styles.footer}>
                <View style={styles.dotsRow}>
                  <View style={styles.dot} />
                  <View style={[styles.dot, styles.dotActive]} />
                  <View style={styles.dot} />
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Onboarding3')} activeOpacity={0.85}>
                  <LinearGradient 
                    colors={Theme.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.nextBtn}
                  >
                    <Text style={styles.nextBtnText}>{t("OnboardingScreen2.Next", { defaultValue: 'Next' })}</Text>
                    <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  backgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  glowOrb1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    top: -height * 0.1,
    right: -width * 0.2,
    filter: 'blur(40px)',
  },
  glowOrb2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    bottom: height * 0.1,
    left: -width * 0.2,
    filter: 'blur(40px)',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  brandText: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: '#ffffff',
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  skipText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 16,
  },
  illustrationWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.9,
    height: height * 0.45,
    borderRadius: 24,
  },
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 32,
    padding: 32,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    width: 28,
    height: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
});

export default OnboardingScreen2;