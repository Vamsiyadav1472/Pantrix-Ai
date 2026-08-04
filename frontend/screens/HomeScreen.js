import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, Dimensions, TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';

const API = 'http://172.23.20.18:8000';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ total_items: 0, expiring_soon: 0, expired: 0 });
  const [expiring, setExpiring] = useState([]);
  const [suggestion, setSuggestion] = useState(t('HomeScreen.welcome'));
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [s, e, a] = await Promise.all([
        fetch(`${API}/pantry/stats`).then(r => r.json()),
        fetch(`${API}/pantry/expiring-soon?days=5`).then(r => r.json()),
        fetch(`${API}/ai/expiry-alert`).then(r => r.json()),
      ]);
      setStats(s);
      setExpiring(e.items || []);
      setSuggestion(a.suggestion || '');
    } catch (err) {
      setStats({ total_items: 5, expiring_soon: 2, expired: 1 });
      setExpiring([
        { id: 1, name: 'Milk', category: 'Dairy', quantity: 500, unit: 'ml', expiry_date: '2025-05-02', icon: '🥛' },
        { id: 2, name: 'Spinach', category: 'Vegetable', quantity: 150, unit: 'g', expiry_date: '2025-05-03', icon: '🥬' },
      ]);
      setSuggestion('Use Milk & Spinach soon — expiring in 2 days! Try Palak Paneer 🥘');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getDaysLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  const getBadge = (days) => {
    if (days <= 1) return { bg: '#fee2e2', color: '#dc2626', label: t('HomeScreen.today') };
    return { bg: days <= 3 ? '#fef9c3' : '#dcfce7', color: days <= 3 ? '#ca8a04' : '#16a34a', label: t('HomeScreen.days', { count: days }) };
  };

  return (
    <ScrollView
      style={styles.container}
      scrollIndicatorInsets={{ right: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          colors={[Theme.colors.primary]}
          tintColor={Theme.colors.primary}
        />
      }
    >
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={['#10B981', '#059669', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.appName}>{t('HomeScreen.appName')}</Text>
          <Text style={styles.subTitle}>{t('HomeScreen.subTitle')}</Text>
        </View>
      </LinearGradient>

      {/* Premium Stats Cards with Gradients */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['#E0F2FE', '#BAE6FD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statIcon}>🥕</Text>
          <Text style={[styles.statVal, { color: '#0284C7' }]}>{stats.total_items}</Text>
          <Text style={styles.statLbl}>{t('HomeScreen.totalItems')}</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#FEE2E2', '#FECACA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statIcon}>⚠️</Text>
          <Text style={[styles.statVal, { color: '#DC2626' }]}>{stats.expiring_soon}</Text>
          <Text style={styles.statLbl}>{t('HomeScreen.expiring')}</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#FEF3C7', '#FCD34D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <Text style={styles.statIcon}>🗑️</Text>
          <Text style={[styles.statVal, { color: '#F59E0B' }]}>{stats.expired}</Text>
          <Text style={styles.statLbl}>{t('HomeScreen.expired')}</Text>
        </LinearGradient>
      </View>

      {/* Premium AI Suggestion Card */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiCardGradient}
      >
        <View style={styles.aiCard}>
          <View style={styles.aiIconContainer}>
            <Text style={styles.aiIcon}>✨</Text>
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>{t('HomeScreen.aiSuggestion')}</Text>
            <Text style={styles.aiText}>{suggestion}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Modern Diet Preference Pills */}
      <View style={styles.dietSection}>
        <Text style={styles.sectionTitle}>{t('HomeScreen.yourPreferences')}</Text>
        <View style={styles.dietTagsRow}>
          <LinearGradient
            colors={['#D1FAE5', '#A7F3D0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dietTag}
          >
            <Text style={styles.dietTagTxt}>{t('HomeScreen.vegetarian')}</Text>
          </LinearGradient>
          <LinearGradient
            colors={['#E5E7EB', '#D1D5DB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dietTag}
          >
            <Text style={styles.dietTagTxt}>{t('HomeScreen.nonVeg')}</Text>
          </LinearGradient>
          <LinearGradient
            colors={['#FEE2E2', '#FECACA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dietTag}
          >
            <Text style={styles.dietTagTxt}>{t('HomeScreen.vegan')}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>{t('HomeScreen.quickActions')}</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['#DBEAFE', '#BFDBFE']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionText}>{t('HomeScreen.scanItem')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['#D1FAE5', '#A7F3D0']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionIcon}>🍽️</Text>
              <Text style={styles.actionText}>{t('HomeScreen.mealPlan')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expiring Soon Section */}
      <View style={styles.expirySection}>
        <Text style={styles.sectionTitle}>{t('HomeScreen.expiringSoon')}</Text>
        {expiring.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>{t('HomeScreen.nothingExpiring')}</Text>
            <Text style={styles.emptySubtext}>{t('HomeScreen.healthyPantry')}</Text>
          </View>
        ) : (
          expiring.map((item) => {
            const days = getDaysLeft(item.expiry_date);
            const badge = getBadge(days);
            return (
              <View key={item.id} style={styles.expiryCardWrapper}>
                <View style={styles.expiryCard}>
                  <View style={styles.expiryIconContainer}>
                    <Text style={styles.expiryIcon}>{item.icon || '🥫'}</Text>
                  </View>
                  <View style={styles.expiryDetails}>
                    <Text style={styles.expiryName}>{item.name}</Text>
                    <Text style={styles.expirySub}>
                      {item.quantity}{item.unit} • {item.category}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeTxt, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  appName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.md,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLbl: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },

  // AI Card
  aiCardGradient: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  aiIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIcon: {
    fontSize: 28,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  aiText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Diet Section
  dietSection: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Theme.colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  dietTagsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dietTag: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  dietTagTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.text,
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.text,
  },

  // Expiry Section
  expirySection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  expiryCardWrapper: {
    marginBottom: 12,
  },
  expiryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...Theme.shadows.md,
  },
  expiryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiryIcon: {
    fontSize: 24,
  },
  expiryDetails: {
    flex: 1,
  },
  expiryName: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.2,
  },
  expirySub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty State
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    color: Theme.colors.text,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    color: Theme.colors.textMuted,
    fontWeight: '500',
    fontSize: 13,
    marginTop: 6,
  },
});