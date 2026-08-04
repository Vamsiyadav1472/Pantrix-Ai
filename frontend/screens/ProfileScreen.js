import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Switch, Modal, TextInput, Dimensions, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, Bell, Lock, HelpCircle, LogOut, ChevronRight, Utensils, AlertTriangle, Users, Moon, WifiOff, FileText, X, Award, Sparkles, Zap, Trash2, Camera, User, Info } from 'lucide-react-native';
import { Theme } from '../theme';
import Card from '../components/Card';
import { profileService, profileStatsService, authService, API_URL } from '../services/api';
import { auth } from '../firebaseConfig';
const {
  width,
  height
} = Dimensions.get('window');
const ProfileScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStats, setProfileStats] = useState({
    cooked: 0,
    badges: 0,
    freshness: 0
  });
  const [profileForm, setProfileForm] = useState({
    bio: '',
    birthday: '',
    phone: '',
    address: ''
  });
  useFocusEffect(useCallback(() => {
    initProfile();
    loadLocalSettings();
  }, []));
  const initProfile = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        const id = parsed.user_id || parsed.id || 1;
        setCurrentUserId(id);
        const savedName = parsed.full_name || parsed.name || parsed.username || parsed.email?.split('@')[0] || 'Pantrix User';
        const savedEmail = parsed.email || '';
        setUser({
          full_name: savedName,
          name: savedName,
          username: savedName,
          email: savedEmail,
          bio: parsed.bio || '',
          birthday: parsed.birthday || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          avatar_url: parsed.avatar_url || ''
        });
        setProfileForm({
          bio: parsed.bio || '',
          birthday: parsed.birthday || '',
          phone: parsed.phone || '',
          address: parsed.address || ''
        });
        fetchProfile(id, savedName, savedEmail);
        fetchProfileStats(id);
      } else {
        setUser({
          full_name: 'Pantrix User',
          name: 'Pantrix User',
          username: 'Pantrix User',
          email: '',
          bio: '',
          birthday: '',
          phone: '',
          address: ''
        });
        setLoading(false);
      }
    } catch (error) {
      console.log('Error initializing profile:', error);
      setUser({
        full_name: 'Pantrix User',
        name: 'Pantrix User',
        username: 'Pantrix User',
        email: '',
        bio: '',
        birthday: '',
        phone: '',
        address: ''
      });
      setLoading(false);
    }
  };
  const fetchProfileStats = async userId => {
    try {
      const response = await profileStatsService.getStats(userId);
      const data = response?.data || response;
      setProfileStats({
        cooked: data?.cooked || 0,
        badges: data?.badges || 0,
        freshness: data?.freshness || 0
      });
    } catch (error) {
      console.log('Error fetching profile stats:', error);
    }
  };
  const fetchProfile = async (id, savedName = '', savedEmail = '') => {
    try {
      if (profileService?.getProfile) {
        const response = await profileService.getProfile(id);
        const data = response?.data || response;
        const backendName = data?.full_name || data?.name || data?.username || data?.display_name || '';
        const finalName = backendName && backendName !== 'Pantrix User' ? backendName : savedName || savedEmail?.split('@')[0] || 'Pantrix User';
        const finalEmail = data?.email || savedEmail || '';
        const updatedUser = {
          full_name: finalName,
          name: finalName,
          username: finalName,
          email: finalEmail,
          bio: data?.bio || '',
          birthday: data?.birthday || '',
          phone: data?.phone || '',
          address: data?.address || ''
        };
        setUser(updatedUser);
        setProfileForm({
          bio: data?.bio || '',
          birthday: data?.birthday || '',
          phone: data?.phone || '',
          address: data?.address || ''
        });
        const oldUserData = await AsyncStorage.getItem('userData');
        const parsedOld = oldUserData ? JSON.parse(oldUserData) : {};
        await AsyncStorage.setItem('userData', JSON.stringify({
          ...parsedOld,
          id: parsedOld.id || id,
          user_id: parsedOld.user_id || id,
          full_name: finalName,
          name: finalName,
          username: finalName,
          email: finalEmail,
          bio: data?.bio || '',
          birthday: data?.birthday || '',
          phone: data?.phone || '',
          address: data?.address || '',
          avatar_url: data?.avatar_url || ''
        }));
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  const saveProfileDetails = async () => {
    try {
      setSavingProfile(true);
      const payload = {
        bio: profileForm.bio || null,
        birthday: profileForm.birthday || null,
        phone: profileForm.phone || null,
        address: profileForm.address || null
      };
      await profileService.updateProfile(currentUserId, payload);
      const updatedUser = {
        ...user,
        bio: profileForm.bio,
        birthday: profileForm.birthday,
        phone: profileForm.phone,
        address: profileForm.address
      };
      setUser(updatedUser);
      const oldUserData = await AsyncStorage.getItem('userData');
      const parsedOld = oldUserData ? JSON.parse(oldUserData) : {};
      await AsyncStorage.setItem('userData', JSON.stringify({
        ...parsedOld,
        bio: profileForm.bio,
        birthday: profileForm.birthday,
        phone: profileForm.phone,
        address: profileForm.address
      }));
      setEditProfileVisible(false);
      Alert.alert('Success', 'Profile details saved successfully.');
    } catch (error) {
      console.log('Error saving profile details:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save profile details.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Denied', 'You need to allow gallery permissions to pick a profile photo.');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        setLoading(true);
        const imageUri = pickerResult.assets[0].uri;
        const response = await authService.uploadAvatar(currentUserId, imageUri);
        
        if (response.data && response.data.avatar_url) {
          const updatedUser = { ...user, avatar_url: response.data.avatar_url };
          setUser(updatedUser);
          
          const oldUserData = await AsyncStorage.getItem('userData');
          const parsedOld = oldUserData ? JSON.parse(oldUserData) : {};
          await AsyncStorage.setItem('userData', JSON.stringify({
            ...parsedOld,
            avatar_url: response.data.avatar_url
          }));
          Alert.alert('Success', 'Profile photo updated successfully!');
        }
      }
    } catch (error) {
      console.log('Error picking avatar:', error);
      Alert.alert('Error', 'Failed to update profile photo.');
    } finally {
      setLoading(false);
    }
  };

  const openEditProfile = () => {
    setProfileForm({
      bio: user?.bio || '',
      birthday: user?.birthday || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setEditProfileVisible(true);
  };
  const loadLocalSettings = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedOfflineMode = await AsyncStorage.getItem('offlineMode');
      setDarkMode(savedDarkMode === 'true');
      setOfflineMode(savedOfflineMode === 'true');
    } catch (error) {
      console.log('Error loading local settings:', error);
    }
  };
  const toggleDarkMode = async value => {
    try {
      setDarkMode(value);
      await AsyncStorage.setItem('darkMode', value ? 'true' : 'false');
      Alert.alert('Dark Mode', value ? 'Dark mode enabled. Restart app to apply theme everywhere.' : 'Dark mode disabled.');
    } catch (error) {
      console.log('Error saving dark mode:', error);
      Alert.alert('Error', 'Failed to save dark mode');
    }
  };
  const toggleOfflineMode = async value => {
    try {
      setOfflineMode(value);
      await AsyncStorage.setItem('offlineMode', value ? 'true' : 'false');
      Alert.alert('Offline Mode', value ? 'Offline mode enabled. App will use saved local data when needed.' : 'Offline mode disabled.');
    } catch (error) {
      console.log('Error saving offline mode:', error);
      Alert.alert('Error', 'Failed to save offline mode');
    }
  };
  const clearCache = async () => {
    Alert.alert('Clear Cache', 'Do you want to clear local cache?', [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Clear',
      style: 'destructive',
      onPress: async () => {
        try {
          await AsyncStorage.removeItem('offlineData');
          Alert.alert('Success', 'Cache cleared successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to clear cache');
        }
      }
    }]);
  };
  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await auth.signOut();
      }
      await AsyncStorage.removeItem('userData');
      navigation.reset({
        index: 0,
        routes: [{
          name: 'Login'
        }]
      });
    } catch (error) {
      console.log('Logout error:', error);
      navigation.replace('Login');
    }
  };
  const menuItems = [{
    title: 'My Kitchen',
    items: [{
      label: 'Diet Preferences',
      icon: <Utensils size={20} color={Theme.colors.primary} />,
      screen: 'DietPreferences'
    }, {
      label: 'Allergy Settings',
      icon: <AlertTriangle size={20} color={Theme.colors.warning} />,
      screen: 'AllergySettings'
    }, {
      label: 'Family Members',
      icon: <Users size={20} color={Theme.colors.info} />,
      screen: 'FamilyMembers'
    }]
  }, {
    title: 'App Settings',
    items: [{
      label: 'My Details',
      icon: <User size={20} color="#3B82F6" />,
      type: 'myDetails'
    }, {
      label: 'Notifications',
      icon: <Bell size={20} color={Theme.colors.purple} />,
      screen: 'NotificationSettings'
    }, {
      label: 'Privacy',
      icon: <Lock size={20} color="#F472B6" />,
      screen: 'PrivacySettings'
    }, {
      label: 'Terms and Conditions',
      icon: <FileText size={20} color="#2563EB" />,
      type: 'terms'
    }, {
      label: 'About Pantrix AI',
      icon: <Info size={20} color="#8b5cf6" />,
      type: 'about'
    }]
  }];
  const handleMenuPress = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
      return;
    }
    if (item.type === 'myDetails') {
      setEditProfileVisible(true);
      return;
    }
    if (item.type === 'terms') {
      setTermsVisible(true);
      return;
    }
    if (item.type === 'about') {
      setAboutVisible(true);
      return;
    }
  };
  const renderRightControl = item => {
    return <ChevronRight size={18} color={Theme.colors.textLight} />;
  };
  if (loading) {
    return <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </SafeAreaView>;
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient 
        colors={Theme.gradients.background} 
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Section */}
        <LinearGradient colors={darkMode ? [Theme.colors.text, Theme.colors.textMuted] : ['#064E3B', '#059669', '#22C55E']} style={styles.heroGradient} start={{
        x: 0,
        y: 0
      }} end={{
        x: 1,
        y: 1
      }}>
          <View style={styles.heroContent}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity onPress={handlePickAvatar}>
                <View style={[styles.avatar, user?.avatar_url && { backgroundColor: 'transparent' }]}>
                  {user?.avatar_url ? (
                    <Image 
                      source={{ uri: user.avatar_url.startsWith('http') ? user.avatar_url : `${API_URL.replace('/api', '')}${user.avatar_url}` }} 
                      style={{ width: '100%', height: '100%', borderRadius: 50 }} 
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  )}
                </View>
                <View style={styles.cameraBadge}>
                  <Camera size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

            </View>

            <Text style={styles.heroName}>
              {user?.full_name || user?.name || user?.username || 'User'}
            </Text>

            <Text style={styles.heroEmail}>
              {user?.email || ''}
            </Text>

            {user?.bio ? <Text style={styles.heroBio}>
                "{user.bio}"
              </Text> : null}

            {/* User detail chips */}
            {user?.birthday || user?.phone || user?.address ? <View style={styles.detailsChipRow}>
                {user?.birthday ? <View style={styles.detailChip}>
                    <Text style={styles.detailChipText}>🎂 {user.birthday}</Text>
                  </View> : null}
                {user?.phone ? <View style={styles.detailChip}>
                    <Text style={styles.detailChipText}>📞 {user.phone}</Text>
                  </View> : null}
              </View> : null}
          </View>
        </LinearGradient>


        {/* Sections */}
        {menuItems.map((section, sectionIndex) => <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, darkMode && styles.darkSubText]}>
              {section.title}
            </Text>

            <View style={[styles.menuGroup, darkMode && styles.darkMenuGroup]}>
              {section.items.map((item, itemIndex) => <TouchableOpacity key={itemIndex} style={[styles.menuItem, itemIndex < section.items.length - 1 && styles.menuItemBorder, darkMode && styles.darkMenuItemBorder]} onPress={() => handleMenuPress(item)} activeOpacity={0.8}>
                  <View style={[styles.menuIconContainer, darkMode && styles.darkIconContainer]}>
                    {item.icon}
                  </View>

                  <Text style={[styles.menuLabel, darkMode && styles.darkText]}>
                    {item.label}
                  </Text>

                  {renderRightControl(item)}
                </TouchableOpacity>)}
            </View>
          </View>)}

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.clearButton} onPress={clearCache} activeOpacity={0.8}>
            <Trash2 size={18} color="#059669" />
            <Text style={styles.clearButtonText}>{t("ProfileScreen.Clear_Cache")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <LogOut size={18} color={Theme.colors.danger} />
            <Text style={styles.logoutText}>{t("ProfileScreen.Sign_Out")}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, darkMode && styles.darkSubText]}>{t("ProfileScreen.PantrixAI_v1_0_0_AI_Powered")}</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editProfileVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.darkCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>{t("ProfileScreen.Edit_Profile_Details")}</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <X size={22} color={darkMode ? Theme.colors.card : Theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalInputLabel, darkMode && styles.darkText]}>{t("ProfileScreen.Bio")}</Text>
              <TextInput value={profileForm.bio} onChangeText={text => setProfileForm({
              ...profileForm,
              bio: text
            })} placeholder={t("ProfileScreen.placeholder_Example_I_love_heal")} placeholderTextColor={Theme.colors.textPlaceholder} style={[styles.modalInput, darkMode && styles.darkInput]} multiline />

              <Text style={[styles.modalInputLabel, darkMode && styles.darkText]}>{t("ProfileScreen.Birthday")}</Text>
              <TextInput value={profileForm.birthday} onChangeText={text => setProfileForm({
              ...profileForm,
              birthday: text
            })} placeholder={t("ProfileScreen.placeholder_YYYY_MM_DD")} placeholderTextColor={Theme.colors.textPlaceholder} style={[styles.modalInput, darkMode && styles.darkInput]} />

              <Text style={[styles.modalInputLabel, darkMode && styles.darkText]}>{t("ProfileScreen.Phone")}</Text>
              <TextInput value={profileForm.phone} onChangeText={text => setProfileForm({
              ...profileForm,
              phone: text
            })} placeholder={t("ProfileScreen.placeholder_Enter_phone_number")} placeholderTextColor={Theme.colors.textPlaceholder} style={[styles.modalInput, darkMode && styles.darkInput]} keyboardType="phone-pad" />

              <Text style={[styles.modalInputLabel, darkMode && styles.darkText]}>{t("ProfileScreen.Address")}</Text>
              <TextInput value={profileForm.address} onChangeText={text => setProfileForm({
              ...profileForm,
              address: text
            })} placeholder={t("ProfileScreen.placeholder_Enter_address")} placeholderTextColor={Theme.colors.textPlaceholder} style={[styles.modalInput, darkMode && styles.darkInput]} multiline />
            </ScrollView>

            <TouchableOpacity style={styles.modalSaveBtn} onPress={saveProfileDetails} disabled={savingProfile} activeOpacity={0.88}>
              <LinearGradient colors={Theme.gradients.primary} style={styles.modalSaveGrad} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 0
            }}>
                <Text style={styles.modalSaveText}>
                  {savingProfile ? 'Saving...' : 'Save Details'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms and Conditions Modal */}
      <Modal visible={termsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.darkCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Terms and Conditions</Text>
              <TouchableOpacity onPress={() => setTermsVisible(false)}>
                <X size={22} color={darkMode ? Theme.colors.card : Theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.termsText, darkMode && styles.darkSubText, {fontFamily: Theme.typography.fontFamily.bodySemiBold}]}>1. Acceptance of Terms</Text>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>By downloading and using PantrixAI, you agree to be bound by these Terms and Conditions.</Text>

              <Text style={[styles.termsText, darkMode && styles.darkSubText, {fontFamily: Theme.typography.fontFamily.bodySemiBold}]}>2. Medical Disclaimer</Text>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>PantrixAI provides nutritional estimations and AI-generated advice. It is NOT a medical application. Always consult a healthcare professional for dietary or medical concerns.</Text>

              <Text style={[styles.termsText, darkMode && styles.darkSubText, {fontFamily: Theme.typography.fontFamily.bodySemiBold}]}>3. User Accounts and Data</Text>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>You are responsible for keeping your login credentials secure. We respect your privacy and manage your data in accordance with our Privacy Policy.</Text>

              <Text style={[styles.termsText, darkMode && styles.darkSubText, {fontFamily: Theme.typography.fontFamily.bodySemiBold}]}>4. Acceptable Use</Text>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>PantrixAI is for your personal, non-commercial use. You agree not to misuse the app or attempt to disrupt its services.</Text>

              <Text style={[styles.termsText, darkMode && styles.darkSubText, {fontFamily: Theme.typography.fontFamily.bodySemiBold}]}>5. Modifications to Terms</Text>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>We reserve the right to modify these terms at any time. Continued use of the app constitutes your acceptance of the updated terms.</Text>
            </ScrollView>

            <TouchableOpacity style={styles.modalSaveBtn} onPress={() => setTermsVisible(false)} activeOpacity={0.88}>
              <LinearGradient colors={Theme.gradients.primary} style={styles.modalSaveGrad} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 0
            }}>
                <Text style={styles.modalSaveText}>{t("ProfileScreen.I_Understand")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Pantrix AI Modal */}
      <Modal visible={aboutVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.darkCard]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>About Pantrix AI</Text>
              <TouchableOpacity onPress={() => setAboutVisible(false)}>
                <X size={22} color={darkMode ? Theme.colors.card : Theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>PantrixAI is your intelligent culinary assistant, designed to simplify food management, reduce waste, and inspire healthy cooking through AI.</Text>
              
              <Text style={[styles.termsText, darkMode && styles.darkSubText, {fontFamily: Theme.typography.fontFamily.bodySemiBold, marginTop: 10}]}>Key Features:</Text>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>• 📸 Smart Scanning: Identify food items, calories, and nutritional information instantly using your camera.</Text>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>• 🥫 Pantry Management: Track your inventory and monitor expiry dates to prevent food waste.</Text>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>• 👨‍🍳 AI Recipe Generator: Discover personalized recipes based on the exact ingredients currently in your kitchen.</Text>
              <Text style={[styles.termsText, darkMode && styles.darkSubText]}>• 🛒 Grocery Lists: Automatically build and manage your shopping lists with smart suggestions.</Text>
              
              <Text style={[styles.termsText, darkMode && styles.darkSubText, {marginTop: 20, textAlign: 'center', fontSize: 12, opacity: 0.7}]}>Version: 1.0.0 (Build 42)</Text>
            </ScrollView>

            <TouchableOpacity style={styles.modalSaveBtn} onPress={() => setAboutVisible(false)} activeOpacity={0.88}>
              <LinearGradient colors={Theme.gradients.primary} style={styles.modalSaveGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.modalSaveText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  backgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
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
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 110,
  },
  heroGradient: {
    paddingTop: 36,
    paddingBottom: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroContent: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    fontSize: 38,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: Theme.colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.card
  },
  heroName: {
    fontSize: 26,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  heroEmail: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#cbd5e1',
    marginTop: 2,
  },
  heroBio: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  detailsChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  detailChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailChipText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
  statsCardContainer: {
    paddingHorizontal: 24,
    marginTop: -28,
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#ffffff',
  },
  darkText: {
    color: Theme.colors.background
  },
  darkSubText: {
    color: Theme.colors.textLight
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 20,
    gap: 16,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  clearButtonText: {
    color: '#10b981',
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
  logoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
    fontFamily: Theme.typography.fontFamily.body,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  termsText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
  },
  modalInputLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    marginBottom: 8,
    marginLeft: 4,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  darkInput: {
    backgroundColor: Theme.colors.text,
    color: Theme.colors.background,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  modalSaveBtn: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    marginTop: 12,
    ...Theme.shadows.md
  },
  modalSaveGrad: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.xl
  },
  modalSaveText: {
    color: Theme.colors.card,
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  }
});