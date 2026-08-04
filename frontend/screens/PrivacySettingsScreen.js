import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Theme } from '../theme';
import { Lock, Shield, Eye, Sparkles, Download, Trash2, ChevronLeft } from 'lucide-react-native';
import { profileService, API_URL } from '../services/api';

const { width, height } = Dimensions.get('window');

const PrivacySettingsScreen = ({
  navigation
}) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState(1);
  const [shareData, setShareData] = useState(true);
  const [profilePublic, setProfilePublic] = useState(false);
  const [allowAISuggestions, setAllowAISuggestions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    loadPrivacySettings();
  }, []));

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      let id = 1;
      if (userData) {
        const parsedUser = JSON.parse(userData);
        id = parsedUser.user_id || parsedUser.id || 1;
      }
      setUserId(id);
      const savedSettings = await AsyncStorage.getItem(`privacySettings_${id}`);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setShareData(parsedSettings.shareData ?? true);
        setProfilePublic(parsedSettings.profilePublic ?? false);
        setAllowAISuggestions(parsedSettings.allowAISuggestions ?? true);
      }
    } catch (error) {
      console.log('Error loading privacy settings:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    try {
      setSaving(true);
      const privacyData = {
        userId,
        shareData,
        profilePublic,
        allowAISuggestions
      };
      await AsyncStorage.setItem(`privacySettings_${userId}`, JSON.stringify(privacyData));
      Alert.alert('Success', 'Privacy settings saved successfully', [{
        text: 'OK',
        onPress: () => navigation?.goBack()
      }]);
    } catch (error) {
      console.log('Error saving privacy settings:', error);
      Alert.alert('Error', 'Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          setSaving(true);
          await profileService.deleteAccount(userId);
          await AsyncStorage.clear();
          navigation.reset({
            index: 0,
            routes: [{
              name: 'Login'
            }]
          });
        } catch (error) {
          setSaving(false);
          console.log('Error deleting account:', error);
          Alert.alert('Error', 'Failed to delete account. Please try again.');
        }
      }
    }]);
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
            <LinearGradient colors={['rgba(219, 39, 119, 0.2)', 'rgba(236, 72, 153, 0.2)']} style={styles.headerIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Lock size={22} color="#db2777" />
            </LinearGradient>
            <View>
              <Text style={styles.title}>{t("PrivacySettingsScreen.Privacy_Settings")}</Text>
              <Text style={styles.subtitle}>{t("PrivacySettingsScreen.Manage_your_data_and_visibilit")}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Controls */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(219, 39, 119, 0.15)' }]}>
                <Shield size={18} color="#db2777" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{t("PrivacySettingsScreen.Share_Anonymous_Data")}</Text>
                <Text style={styles.rowSub}>{t("PrivacySettingsScreen.Help_improve_AI_model_suggesti")}</Text>
              </View>
              <Switch 
                value={shareData} 
                onValueChange={setShareData} 
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: Theme.colors.primary }} 
                thumbColor="#FFFFFF" 
              />
            </View>

            <View style={[styles.row, styles.rowBorder]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Eye size={18} color="#3b82f6" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{t("PrivacySettingsScreen.Public_Profile")}</Text>
                <Text style={styles.rowSub}>{t("PrivacySettingsScreen.Allow_other_users_to_see_your")}</Text>
              </View>
              <Switch 
                value={profilePublic} 
                onValueChange={setProfilePublic} 
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: Theme.colors.primary }} 
                thumbColor="#FFFFFF" 
              />
            </View>

            <View style={[styles.row, styles.rowBorder]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Sparkles size={18} color="#8b5cf6" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{t("PrivacySettingsScreen.AI_Custom_Suggestions")}</Text>
                <Text style={styles.rowSub}>{t("PrivacySettingsScreen.Use_pantry_history_for_persona")}</Text>
              </View>
              <Switch 
                value={allowAISuggestions} 
                onValueChange={setAllowAISuggestions} 
                trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: Theme.colors.primary }} 
                thumbColor="#FFFFFF" 
              />
            </View>
          </View>

          {/* Action Links */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.dangerCard} onPress={deleteAccount} activeOpacity={0.8}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Trash2 size={18} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dangerTitle}>{t("PrivacySettingsScreen.Delete_Account")}</Text>
                <Text style={styles.actionSub}>{t("PrivacySettingsScreen.Permanently_delete_all_your_pe")}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={savePrivacySettings} disabled={saving} activeOpacity={0.88}>
            <LinearGradient colors={Theme.gradients.primary} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>{t("PrivacySettingsScreen.Save_Privacy_Settings")}</Text>}
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
    borderColor: 'rgba(219, 39, 119, 0.3)'
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
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rowInfo: {
    flex: 1
  },
  rowTitle: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  rowSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Theme.typography.fontFamily.body,
    marginTop: 2
  },
  actionSection: {
    gap: 12
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dangerTitle: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 15,
    color: '#ef4444'
  },
  actionSub: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2
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

export default PrivacySettingsScreen;