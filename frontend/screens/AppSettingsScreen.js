import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
  ScrollView, Alert, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import {
  Moon, WifiOff, Trash2, FileText, Info,
  ChevronRight, ChevronLeft, Settings, Globe
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const AppSettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [userId, setUserId] = useState(1);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      let id = 1;
      if (userData) {
        const parsedUser = JSON.parse(userData);
        id = parsedUser.user_id || parsedUser.id || 1;
      }
      setUserId(id);
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const showComingSoon = (feature) => {
    Alert.alert(t('AppSettingsScreen.comingSoon'), t('AppSettingsScreen.featureFutureUpdate', { feature }));
  };

  const showAppVersion = () => {
    Alert.alert(t('AppSettingsScreen.appVersion'), 'PantrixAI v1.0.0 (Build 42)\nAll systems operational.');
  };

  const clearCache = () => {
    Alert.alert(
      t('AppSettingsScreen.clearCacheConfirmTitle'),
      t('AppSettingsScreen.clearCacheConfirmSub'),
      [
        { text: t('AppSettingsScreen.cancel'), style: 'cancel' },
        {
          text: t('AppSettingsScreen.clear'),
          style: 'destructive',
          onPress: () => Alert.alert('Done', t('AppSettingsScreen.cacheCleared')),
        },
      ]
    );
  };

  const sections = [
    {
      title: t('AppSettingsScreen.dataConnectivity'),
      icon: '⚡',
      items: [
        {
          label: t('AppSettingsScreen.clearCache'),
          subtitle: t('AppSettingsScreen.clearCacheSub'),
          icon: <Trash2 size={19} color="#ef4444" />,
          iconBg: 'rgba(239, 68, 68, 0.15)',
          type: 'action',
          onPress: clearCache,
        },
      ],
    },
    {
      title: t('AppSettingsScreen.about'),
      icon: 'ℹ️',
      items: [
        {
          label: t('AppSettingsScreen.appVersion'),
          subtitle: 'PantrixAI v1.0.0 (Build 42)',
          icon: <Info size={19} color="#8b5cf6" />,
          iconBg: 'rgba(139, 92, 246, 0.15)',
          type: 'info',
          onPress: showAppVersion,
        },
        {
          label: t('AppSettingsScreen.termsOfService'),
          subtitle: t('AppSettingsScreen.termsSub'),
          icon: <FileText size={19} color="#f59e0b" />,
          iconBg: 'rgba(245, 158, 11, 0.15)',
          type: 'nav',
          onPress: () => showComingSoon(t('AppSettingsScreen.termsOfService')),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Theme.gradients.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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
            <LinearGradient
              colors={Theme.gradients.primary}
              style={styles.headerIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Settings size={22} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.title}>{t('AppSettingsScreen.settings')}</Text>
              <Text style={styles.subtitle}>{t('AppSettingsScreen.appPreferences')}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section, si) => (
            <View key={si} style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionEmoji}>{section.icon}</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              <View style={styles.card}>
                {section.items.map((item, ii) => (
                  <TouchableOpacity
                    key={ii}
                    style={[
                      styles.row,
                      ii < section.items.length - 1 && styles.rowBorder,
                    ]}
                    onPress={item.onPress}
                    activeOpacity={item.type === 'toggle' ? 1 : 0.8}
                    disabled={item.type === 'toggle'}
                  >
                    <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                      {item.icon}
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      {item.subtitle && <Text style={styles.rowSub}>{item.subtitle}</Text>}
                    </View>
                    {item.type === 'toggle' && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onChange}
                        trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: Theme.colors.primary }}
                        thumbColor="#FFFFFF"
                      />
                    )}
                    {(item.type === 'nav' || item.type === 'action' || item.type === 'info') && (
                      <ChevronRight size={18} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <Text style={styles.footer}>{t('AppSettingsScreen.madeWithLove')}</Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  gradient: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
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
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 110,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionEmoji: {
    fontSize: 15,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 15,
    color: '#ffffff',
  },
  rowSub: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  footer: {
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    paddingBottom: 20,
  },
});

export default AppSettingsScreen;
