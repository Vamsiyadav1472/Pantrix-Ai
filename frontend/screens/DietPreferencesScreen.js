import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Theme } from '../theme';
import { profileService } from '../services/api';
import { ChevronLeft, Utensils, Check, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const DIET_OPTIONS = [{
  name: 'Vegan',
  emoji: '🌱',
  desc: 'No animal products'
}, {
  name: 'Vegetarian',
  emoji: '🥗',
  desc: 'No meat or seafood'
}, {
  name: 'Keto',
  emoji: '🥑',
  desc: 'High fat, ultra-low carb'
}, {
  name: 'Paleo',
  emoji: '🥩',
  desc: 'Lean meats, fish, fruits, nuts'
}, {
  name: 'Low Carb',
  emoji: '🍳',
  desc: 'Reduced carbohydrate intake'
}, {
  name: 'Pescatarian',
  emoji: '🐟',
  desc: 'Plant-based plus seafood'
}];

const DietPreferencesScreen = ({
  navigation
}) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diets, setDiets] = useState(DIET_OPTIONS.map(d => ({
    ...d,
    selected: false
  })));

  useFocusEffect(useCallback(() => {
    initializeScreen();
  }, []));

  const initializeScreen = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        const id = parsed.user_id || parsed.id || 1;
        setUserId(id);
        await fetchDietPreferences(id);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error('Error initializing screen:', e);
      setLoading(false);
    }
  };

  const fetchDietPreferences = async id => {
    try {
      const response = await profileService.getDietPreferences(id);
      const preference = response.data?.preference || '';
      if (preference) {
        const selectedDiets = preference.split(',').map(d => d.trim());
        setDiets(prevDiets => prevDiets.map(diet => ({
          ...diet,
          selected: selectedDiets.includes(diet.name)
        })));
      }
    } catch (error) {
      console.log('No diet preferences found, using defaults:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDiet = dietName => {
    setDiets(prevDiets => prevDiets.map(diet => diet.name === dietName ? {
      ...diet,
      selected: !diet.selected
    } : diet));
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }
    try {
      setSaving(true);
      const selectedDiets = diets.filter(d => d.selected).map(d => d.name);
      const preferenceString = selectedDiets.join(',');
      await profileService.updateDietPreferences(userId, preferenceString);
      Alert.alert('Success', 'Diet preferences updated successfully', [{
        text: 'OK',
        onPress: () => navigation.goBack()
      }]);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save diet preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={Theme.gradients.background} style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />

        {/* Header */}
        <View style={styles.header}>
          {navigation && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={22} color="#ffffff" />
            </TouchableOpacity>
          )}
          <View style={styles.headerCenter}>
            <LinearGradient colors={Theme.gradients.primary} style={styles.headerIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Utensils size={22} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.title}>{t("DietPreferencesScreen.Dietary_Preferences")}</Text>
              <Text style={styles.subtitle}>{t("DietPreferencesScreen.Help_AI_tailor_your_recipe_sug")}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBanner}>
            <Sparkles size={18} color="#10b981" />
            <Text style={styles.infoBannerText}>{t("DietPreferencesScreen.Selected_preferences_will_auto")}</Text>
          </View>

          <View style={styles.list}>
            {diets.map((diet, i) => (
              <TouchableOpacity key={i} style={[styles.card, diet.selected && styles.selectedCard]} onPress={() => toggleDiet(diet.name)} activeOpacity={0.88}>
                <View style={styles.emojiBg}>
                  <Text style={{ fontSize: 24 }}>{diet.emoji}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.name, diet.selected && styles.selectedName]}>{diet.name}</Text>
                  <Text style={styles.desc}>{diet.desc}</Text>
                </View>
                {diet.selected ? (
                  <LinearGradient colors={Theme.gradients.primary} style={styles.checkCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  </LinearGradient>
                ) : (
                  <View style={styles.uncheckCircle} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.88}>
            <LinearGradient colors={Theme.gradients.primary} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveButtonText}>{t("DietPreferencesScreen.Update_Preferences")}</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  gradient: {
    flex: 1
  },
  glowOrb1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    top: -height * 0.1,
    right: -width * 0.2,
  },
  glowOrb2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    bottom: height * 0.1,
    left: -width * 0.2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.3
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)'
  },
  infoBannerText: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: '#10b981',
    lineHeight: 18
  },
  list: {
    gap: 10
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 14,
  },
  selectedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)'
  },
  emojiBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardInfo: {
    flex: 1
  },
  name: {
    fontSize: 16,
    color: '#000000',
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  selectedName: {
    color: '#000000'
  },
  desc: {
    fontSize: 12,
    color: '#000000',
    fontFamily: Theme.typography.fontFamily.body,
    marginTop: 2
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center'
  },
  uncheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveBtnGrad: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading
  }
});

export default DietPreferencesScreen;