import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { Bell, ChevronLeft, AlertTriangle, ShoppingBag, Utensils, Info } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const NotificationSettingsScreen = ({
  navigation
}) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState(1);
  const [expiry, setExpiry] = useState(true);
  const [grocery, setGrocery] = useState(true);
  const [recipes, setRecipes] = useState(false);
  const [system, setSystem] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    loadSettings();
  }, []));

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      let id = 1;
      if (userData) {
        const parsedUser = JSON.parse(userData);
        id = parsedUser.user_id || parsedUser.id || 1;
      }
      setUserId(id);
      const savedSettings = await AsyncStorage.getItem(`notificationSettings_${id}`);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setExpiry(parsed.expiry ?? true);
        setGrocery(parsed.grocery ?? true);
        setRecipes(parsed.recipes ?? false);
        setSystem(parsed.system ?? true);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const settingsData = {
        expiry,
        grocery,
        recipes,
        system
      };
      await AsyncStorage.setItem(`notificationSettings_${userId}`, JSON.stringify(settingsData));
      Alert.alert('Success', 'Notification settings saved successfully', [{
        text: 'OK',
        onPress: () => navigation?.goBack()
      }]);
    } catch (error) {
      console.log('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
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

  const notifItems = [{
    title: 'Expiry Alerts',
    sub: 'Get notified before items expire in your pantry',
    icon: <AlertTriangle size={20} color="#f59e0b" />,
    iconBg: 'rgba(245, 158, 11, 0.15)',
    val: expiry,
    set: setExpiry
  }, {
    title: 'Grocery Reminders',
    sub: 'Smart notifications for your active shopping lists',
    icon: <ShoppingBag size={20} color="#10b981" />,
    iconBg: 'rgba(16, 185, 129, 0.15)',
    val: grocery,
    set: setGrocery
  }, {
    title: 'Recipe Suggestions',
    sub: 'New AI recipes tailored to items expiring soon',
    icon: <Utensils size={20} color="#a855f7" />,
    iconBg: 'rgba(168, 85, 247, 0.15)',
    val: recipes,
    set: setRecipes
  }, {
    title: 'System Updates',
    sub: 'Important app features and security notifications',
    icon: <Info size={20} color="#3b82f6" />,
    iconBg: 'rgba(59, 130, 246, 0.15)',
    val: system,
    set: setSystem
  }];

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
              <Bell size={22} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.title}>{t("NotificationSettingsScreen.Notification_Settings")}</Text>
              <Text style={styles.subtitle}>{t("NotificationSettingsScreen.Control_how_when_Pantrix_not")}</Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {notifItems.map((item, i) => (
              <View key={i} style={[styles.row, i < notifItems.length - 1 && styles.rowBorder]}>
                <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                  {item.icon}
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.rowLabel}>{item.title}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                <Switch 
                  value={item.val} 
                  onValueChange={item.set} 
                  trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: Theme.colors.primary }} 
                  thumbColor="#FFFFFF" 
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={saveSettings} disabled={saving} activeOpacity={0.88}>
            <LinearGradient colors={Theme.gradients.primary} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>{t("NotificationSettingsScreen.Save_Notification_Settings")}</Text>}
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
    paddingBottom: 110
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textCol: {
    flex: 1
  },
  rowLabel: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  rowSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Theme.typography.fontFamily.body,
    marginTop: 2,
    lineHeight: 17
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

export default NotificationSettingsScreen;