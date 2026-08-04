import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { X, ShieldAlert, Plus, Search, ChevronLeft, Check, AlertTriangle } from 'lucide-react-native';
import { Theme } from '../theme';
import { profileService } from '../services/api';

const { width, height } = Dimensions.get('window');

const COMMON_ALLERGIES = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Shellfish', 'Fish', 'Gluten', 'Sesame', 'Mustard', 'Corn', 'Coconut', 'Strawberry', 'Tomato'];
const ALLERGY_EMOJIS = {
  Peanuts: '🥜',
  'Tree Nuts': '🌰',
  Dairy: '🥛',
  Eggs: '🥚',
  Soy: '🫘',
  Wheat: '🌾',
  Shellfish: '🦐',
  Fish: '🐟',
  Gluten: '🍞',
  Sesame: '🫘',
  Mustard: '🟡',
  Corn: '🌽',
  Coconut: '🥥',
  Strawberry: '🍓',
  Tomato: '🍅'
};

const AllergySettingsScreen = ({
  navigation
}) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [customAllergy, setCustomAllergy] = useState('');

  useFocusEffect(useCallback(() => {
    initializeScreen();
  }, []));

  const initializeScreen = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        const id = parsed.user_id || parsed.id || 1;
        setUserId(id);
        await fetchAllergies(id);
      } else {
        const id = 1;
        setUserId(id);
        await fetchAllergies(id);
      }
    } catch (error) {
      console.log('Error initializing allergy screen:', error);
      setSelectedAllergies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllergies = async id => {
    try {
      if (!profileService || !profileService.getAllergies) {
        setSelectedAllergies([]);
        return;
      }
      const response = await profileService.getAllergies(id);
      let data = response?.data || response || [];
      if (data?.allergies && Array.isArray(data.allergies)) {
        setSelectedAllergies(data.allergies);
        return;
      }
      if (Array.isArray(data)) {
        const allergyNames = data.map(item => {
          if (typeof item === 'string') return item;
          return item.allergen || item.name || item.title;
        }).filter(Boolean);
        setSelectedAllergies(allergyNames);
        return;
      }
      if (typeof data === 'string' && data.trim()) {
        setSelectedAllergies(data.split(',').map(item => item.trim()));
        return;
      }
      setSelectedAllergies([]);
    } catch (error) {
      console.log('Error fetching allergies:', error);
      setSelectedAllergies([]);
    }
  };

  const toggleAllergy = allergyName => {
    if (selectedAllergies.includes(allergyName)) {
      setSelectedAllergies(selectedAllergies.filter(item => item !== allergyName));
    } else {
      setSelectedAllergies([...selectedAllergies, allergyName]);
    }
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergy.trim();
    if (!trimmed) return;
    if (!selectedAllergies.includes(trimmed)) {
      setSelectedAllergies([...selectedAllergies, trimmed]);
    }
    setCustomAllergy('');
  };

  const removeAllergy = allergyName => {
    setSelectedAllergies(selectedAllergies.filter(item => item !== allergyName));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const targetUserId = userId || 1;
      if (profileService?.updateAllergies) {
        await profileService.updateAllergies(targetUserId, selectedAllergies);
      }
      Alert.alert('Success', 'Allergy settings updated successfully.', [{
        text: 'OK',
        onPress: () => navigation?.goBack()
      }]);
    } catch (error) {
      console.log('Error saving allergies:', error);
      Alert.alert('Save Error', error.response?.data?.detail || 'Failed to save allergy settings.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCommonAllergies = COMMON_ALLERGIES.filter(item => item.toLowerCase().includes(searchText.toLowerCase()));

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
            <LinearGradient colors={['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.2)']} style={styles.headerIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <AlertTriangle size={22} color="#f59e0b" />
            </LinearGradient>
            <View>
              <Text style={styles.title}>{t("AllergySettingsScreen.Allergy_Settings")}</Text>
              <Text style={styles.subtitle}>{t("AllergySettingsScreen.Protect_yourself_with_automati")}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Active Selected Allergies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("AllergySettingsScreen.Active_Allergies")}{selectedAllergies.length})</Text>

            {selectedAllergies.length === 0 ? (
              <View style={styles.emptyCard}>
                <ShieldAlert size={28} color="#94a3b8" />
                <Text style={styles.emptyText}>{t("AllergySettingsScreen.No_allergies_selected_Pick_fr")}</Text>
              </View>
            ) : (
              <View style={styles.chipsWrap}>
                {selectedAllergies.map((item, index) => (
                  <View key={index} style={styles.selectedChip}>
                    <Text style={styles.selectedChipEmoji}>{ALLERGY_EMOJIS[item] || '⚠️'}</Text>
                    <Text style={styles.selectedChipText}>{item}</Text>
                    <TouchableOpacity onPress={() => removeAllergy(item)} style={styles.removeBtn}>
                      <X size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Add Custom Allergy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("AllergySettingsScreen.Add_Custom_Allergen")}</Text>
            <View style={styles.addCustomRow}>
              <TextInput 
                value={customAllergy} 
                onChangeText={setCustomAllergy} 
                placeholder={t("AllergySettingsScreen.placeholder_Example_Sulfites_M")} 
                placeholderTextColor="#64748b" 
                style={styles.customInput} 
              />
              <TouchableOpacity onPress={addCustomAllergy} style={styles.addBtn} activeOpacity={0.8}>
                <LinearGradient colors={Theme.gradients.primary} style={styles.addBtnGrad}>
                  <Plus size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Common Allergies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("AllergySettingsScreen.Select_Common_Allergens")}</Text>
            <View style={styles.searchBar}>
              <Search size={18} color="#94a3b8" />
              <TextInput 
                value={searchText} 
                onChangeText={setSearchText} 
                placeholder={t("AllergySettingsScreen.placeholder_Search_common_allerg")} 
                placeholderTextColor="#64748b" 
                style={styles.searchInput} 
              />
            </View>

            <View style={styles.commonGrid}>
              {filteredCommonAllergies.map((item, index) => {
                const isSelected = selectedAllergies.includes(item);
                return (
                  <TouchableOpacity key={index} style={[styles.commonChip, isSelected && styles.commonChipSelected]} onPress={() => toggleAllergy(item)} activeOpacity={0.8}>
                    <Text style={styles.commonEmoji}>{ALLERGY_EMOJIS[item] || '🥦'}</Text>
                    <Text style={[styles.commonText, isSelected && styles.commonTextSelected]}>{item}</Text>
                    {isSelected && <Check size={14} color="#10b981" strokeWidth={3} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.88}>
            <LinearGradient colors={Theme.gradients.primary} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>{t("AllergySettingsScreen.Save_Allergy_Settings")}</Text>}
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
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
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
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  emptyCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  emptyText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center'
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16
  },
  selectedChipEmoji: {
    fontSize: 14
  },
  selectedChipText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 13,
    color: '#ef4444'
  },
  removeBtn: {
    marginLeft: 4
  },
  addCustomRow: {
    flexDirection: 'row',
    gap: 10
  },
  customInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  addBtn: {
    borderRadius: 16,
    overflow: 'hidden'
  },
  addBtnGrad: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#ffffff'
  },
  commonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  commonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  commonChipSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)'
  },
  commonEmoji: {
    fontSize: 14
  },
  commonText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: '#cbd5e1'
  },
  commonTextSelected: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#10b981'
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
    borderTopColor: 'rgba(255, 255, 255, 0.12)'
  },
  saveBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtnGrad: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading
  }
});

export default AllergySettingsScreen;