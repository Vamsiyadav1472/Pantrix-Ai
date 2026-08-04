import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WifiOff, RefreshCw, Database, BrainCircuit, ChevronRight } from 'lucide-react-native';
const OfflineModeScreen = () => {
  const {
    t
  } = useTranslation();
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, '#F3F4F6', '#E5E7EB']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationWrap}>
          <LinearGradient colors={[Theme.colors.card, '#F3F4F6']} style={styles.illustrationBg}>
            <WifiOff size={56} color="#9CA3AF" strokeWidth={1.5} />
          </LinearGradient>
          <View style={styles.warningBadge}>
            <Text style={{
            fontSize: 12,
            fontWeight: '800',
            color: Theme.colors.card
          }}>!</Text>
          </View>
        </View>

        <Text style={styles.title}>{t("OfflineModeScreen.You_re_Offline")}</Text>
        <Text style={styles.subtitle}>{t("OfflineModeScreen.Some_features_are_unavailable")}</Text>
        
        {/* Status Card */}
        <View style={styles.statusCard}>
          <Text style={styles.cardHeader}>{t("OfflineModeScreen.System_Status")}</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={[styles.iconBg, {
              backgroundColor: Theme.colors.backgroundMid
            }]}>
                <Database size={18} color="#059669" />
              </View>
              <Text style={styles.statusLabel}>{t("OfflineModeScreen.Local_Data_Sync")}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.dot, {
              backgroundColor: '#10B981'
            }]} />
              <Text style={styles.statusVal}>{t("OfflineModeScreen.Synced_2m_ago")}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={[styles.iconBg, {
              backgroundColor: '#F3F4F6'
            }]}>
                <BrainCircuit size={18} color="#9CA3AF" />
              </View>
              <Text style={[styles.statusLabel, styles.disabled]}>{t("OfflineModeScreen.AI_Recommendations")}</Text>
            </View>
            <View style={[styles.statusBadge, {
            backgroundColor: '#F3F4F6'
          }]}>
              <View style={[styles.dot, {
              backgroundColor: '#9CA3AF'
            }]} />
              <Text style={[styles.statusVal, styles.disabled]}>{t("OfflineModeScreen.Offline")}</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.btnWrapper} activeOpacity={0.8}>
          <LinearGradient colors={['#374151', Theme.colors.text]} style={styles.primaryBtn} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }}>
            <RefreshCw size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.primaryBtnText}>{t("OfflineModeScreen.Try_to_Reconnect")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  illustrationWrap: {
    position: 'relative',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6
  },
  illustrationBg: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Theme.colors.card
  },
  warningBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Theme.colors.card,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 12,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20
  },
  statusCard: {
    width: '100%',
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.backgroundMid,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669'
  },
  disabled: {
    color: '#9CA3AF'
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16
  },
  btnWrapper: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10
  },
  primaryBtnText: {
    color: Theme.colors.card,
    fontSize: 16,
    fontWeight: '700'
  }
});
export default OfflineModeScreen;