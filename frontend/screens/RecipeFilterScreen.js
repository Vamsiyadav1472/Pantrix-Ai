import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Filter, RotateCcw, ChevronLeft, Clock, Leaf, Dumbbell, Wheat, Flame, Droplets } from 'lucide-react-native';
import Button from '../components/Button';
import { Theme } from '../theme';
const DIETS = [{
  label: 'Quick & Easy',
  emoji: '⚡',
  color: '#F59E0B'
}, {
  label: 'Vegetarian',
  emoji: '🌱',
  color: '#059669'
}, {
  label: 'High Protein',
  emoji: '💪',
  color: '#3B82F6'
}, {
  label: 'Gluten-Free',
  emoji: '🌾',
  color: '#D97706'
}, {
  label: 'Low Carb',
  emoji: '📉',
  color: '#8B5CF6'
}, {
  label: 'Vegan',
  emoji: '🥗',
  color: '#10B981'
}, {
  label: 'Keto',
  emoji: '🥑',
  color: '#EC4899'
}, {
  label: 'Dairy-Free',
  emoji: '🥛',
  color: '#6B7280'
}];
const TIMES = ['< 15m', '< 30m', '< 45m', '1h+'];
const RecipeFilterScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [selectedDiets, setSelectedDiets] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [excludeMissing, setExcludeMissing] = useState(false);
  const [prioritizeExpiry, setPrioritizeExpiry] = useState(true);
  const toggleDiet = diet => {
    setSelectedDiets(prev => prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]);
  };
  const resetFilters = () => {
    setSelectedDiets([]);
    setSelectedTime(null);
    setExcludeMissing(false);
    setPrioritizeExpiry(true);
  };
  const activeCount = selectedDiets.length + (selectedTime ? 1 : 0);
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, Theme.colors.backgroundMid, '#E8FDF3']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#374151" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t("RecipeFilterScreen.Filters")}</Text>
          {activeCount > 0 && <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{activeCount}{t("RecipeFilterScreen.active")}</Text>
            </View>}
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
          <RotateCcw size={18} color="#EF4444" strokeWidth={2} />
          <Text style={styles.resetText}>{t("RecipeFilterScreen.Reset")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{
      paddingBottom: 100,
      paddingHorizontal: 20,
      paddingTop: 8
    }} showsVerticalScrollIndicator={false}>
        {/* Dietary Needs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Leaf size={18} color="#059669" strokeWidth={2} />
            <Text style={styles.sectionTitle}>{t("RecipeFilterScreen.Dietary_Preferences")}</Text>
          </View>
          <View style={styles.chipGrid}>
            {DIETS.map((diet, i) => {
            const active = selectedDiets.includes(diet.label);
            return <TouchableOpacity key={i} style={[styles.chip, active && {
              backgroundColor: diet.color,
              borderColor: diet.color
            }]} onPress={() => toggleDiet(diet.label)} activeOpacity={0.8}>
                  <Text style={styles.chipEmoji}>{diet.emoji}</Text>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{diet.label}</Text>
                </TouchableOpacity>;
          })}
          </View>
        </View>

        {/* Cooking Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color="#059669" strokeWidth={2} />
            <Text style={styles.sectionTitle}>{t("RecipeFilterScreen.Cooking_Time")}</Text>
          </View>
          <View style={styles.timeRow}>
            {TIMES.map((time, i) => {
            const active = selectedTime === time;
            return <TouchableOpacity key={i} style={[styles.timeChip, active && styles.timeChipActive]} onPress={() => setSelectedTime(active ? null : time)} activeOpacity={0.8}>
                  {active && <LinearGradient colors={['#059669', '#10B981']} style={StyleSheet.absoluteFill} borderRadius={14} />}
                  <Text style={[styles.timeText, active && styles.timeTextActive]}>{time}</Text>
                </TouchableOpacity>;
          })}
          </View>
        </View>

        {/* Smart Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Flame size={18} color="#059669" strokeWidth={2} />
            <Text style={styles.sectionTitle}>{t("RecipeFilterScreen.Smart_Preferences")}</Text>
          </View>
          <View style={styles.prefList}>
            <View style={styles.prefCard}>
              <View style={styles.prefLeft}>
                <View style={styles.prefIconBg}>
                  <Droplets size={18} color="#3B82F6" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.prefLabel}>{t("RecipeFilterScreen.Exclude_missing_items")}</Text>
                  <Text style={styles.prefSub}>{t("RecipeFilterScreen.Only_show_recipes_I_can_make_n")}</Text>
                </View>
              </View>
              <Switch value={excludeMissing} onValueChange={setExcludeMissing} trackColor={{
              false: '#E5E7EB',
              true: '#059669'
            }} thumbColor="#FFFFFF" />
            </View>
            <View style={styles.prefCard}>
              <View style={styles.prefLeft}>
                <View style={[styles.prefIconBg, {
                backgroundColor: '#FEF3C7'
              }]}>
                  <Flame size={18} color="#F59E0B" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.prefLabel}>{t("RecipeFilterScreen.Prioritize_expiring_items")}</Text>
                  <Text style={styles.prefSub}>{t("RecipeFilterScreen.Use_items_before_they_go_bad")}</Text>
                </View>
              </View>
              <Switch value={prioritizeExpiry} onValueChange={setPrioritizeExpiry} trackColor={{
              false: '#E5E7EB',
              true: '#059669'
            }} thumbColor="#FFFFFF" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <LinearGradient colors={['rgba(248,250,252,0)', Theme.colors.background]} style={styles.footerFade} />
        <View style={styles.footerContent}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>{t("RecipeFilterScreen.Cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtnWrapper} onPress={() => {
            navigation.navigate({
              name: 'RecipeRecommendation',
              params: { filters: { selectedDiets, selectedTime, excludeMissing, prioritizeExpiry } },
              merge: true
            });
          }}>
            <LinearGradient colors={['#059669', '#10B981']} style={styles.applyBtn}>
              <Text style={styles.applyText}>{t("RecipeFilterScreen.Apply_Filters")}</Text>
              {activeCount > 0 && <View style={styles.applyBadge}>
                  <Text style={styles.applyBadgeText}>{activeCount}</Text>
                </View>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.primary
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#059669',
    borderRadius: 10
  },
  activeBadgeText: {
    color: Theme.colors.card,
    fontSize: 11,
    fontWeight: '700'
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444'
  },
  section: {
    marginBottom: 28
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.primary
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: Theme.colors.card
  },
  chipEmoji: {
    fontSize: 15
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.primary
  },
  chipTextActive: {
    color: Theme.colors.card
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10
  },
  timeChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Theme.colors.card,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    overflow: 'hidden'
  },
  timeChipActive: {
    borderColor: 'transparent'
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary
  },
  timeTextActive: {
    color: Theme.colors.card
  },
  prefList: {
    gap: 12
  },
  prefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.card,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1
  },
  prefIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  prefLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary
  },
  prefSub: {
    fontSize: 12,
    color: Theme.colors.primary,
    marginTop: 1
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  footerFade: {
    height: 20
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Theme.colors.card,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center'
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.primary
  },
  applyBtnWrapper: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden'
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.card
  },
  applyBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  applyBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.card
  }
});
export default RecipeFilterScreen;