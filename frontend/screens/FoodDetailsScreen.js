import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { ChevronLeft, Zap, ChefHat, HeartPulse, Flame, ShieldAlert, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
const {
  width
} = Dimensions.get('window');
const FoodDetailsScreen = ({
  route,
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const {
    food
  } = route.params || {};
  const [activeTab, setActiveTab] = useState('calories');
  if (!food) {
    return <SafeAreaView style={styles.container}>
        <LinearGradient colors={Theme.gradients.background} style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>{t("FoodDetailsScreen.Food_details_not_available")}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnEmpty}>
            <Text style={{
            color: Theme.colors.primary,
            fontFamily: Theme.typography.fontFamily.bodySemiBold
          }}>{t("FoodDetailsScreen.Go_Back")}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>;
  }
  const result = food;
  const nutritionItems = [{
    label: 'Protein',
    value: `${result.nutrition?.protein || result.protein || 0}g`,
    color: '#3B82F6',
    bg: '#DBEAFE'
  }, {
    label: 'Carbs',
    value: `${result.nutrition?.carbs || result.carbs || 0}g`,
    color: '#F59E0B',
    bg: '#FEF3C7'
  }, {
    label: 'Fat',
    value: `${result.nutrition?.fats || result.nutrition?.fat || result.fat || 0}g`,
    color: '#EF4444',
    bg: '#FEE2E2'
  }, {
    label: 'Fiber',
    value: `${result.nutrition?.fiber || result.fiber || 0}g`,
    color: '#10B981',
    bg: '#D1FAE5'
  }, {
    label: 'Sugar',
    value: `${result.nutrition?.sugar || result.sugar || 0}g`,
    color: '#EC4899',
    bg: '#FCE7F3'
  }, {
    label: 'Sodium',
    value: `${result.nutrition?.sodium || result.sodium || 0}mg`,
    color: '#8B5CF6',
    bg: '#EDE9FE'
  }];
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={22} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("FoodDetailsScreen.AI_Scan_Analysis")}</Text>
          <View style={{
          width: 40
        }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Detected Header Card */}
          <View style={styles.foodNameCard}>
            <View style={styles.foodIconWrap}>
              <Text style={styles.foodEmoji}>🥗</Text>
            </View>
            <Text style={styles.foodNameLabel}>{t("FoodDetailsScreen.AI_DETECTED_FOOD")}</Text>
            <Text style={styles.foodNameMain}>{result.food_name || 'Unknown Item'}</Text>

            {result.estimated_weight && <View style={styles.weightTag}>
                <Text style={styles.weightText}>{t("FoodDetailsScreen.Est_Weight")}{result.estimated_weight}</Text>
              </View>}

            {result.description && <Text style={styles.foodDesc}>{result.description}</Text>}

            {result.health_score ? <View style={styles.healthScoreBadge}>
                <Award size={16} color="#065F46" />
                <Text style={styles.healthScoreText}>{t("FoodDetailsScreen.Health_Score")}{result.health_score}/10</Text>
              </View> : null}
          </View>

          {/* Toggle Tabs */}
          <View style={styles.optionsGrid}>
            <TouchableOpacity style={[styles.optionCard, activeTab === 'calories' && styles.activeOption]} onPress={() => setActiveTab('calories')} activeOpacity={0.85}>
              <Zap size={20} color={activeTab === 'calories' ? '#FFF' : '#000000'} />
              <Text style={[styles.optionText, activeTab === 'calories' && styles.activeOptionText]}>{t("FoodDetailsScreen.Nutrition_Info")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionCard, activeTab === 'process' && styles.activeOption]} onPress={() => setActiveTab('process')} activeOpacity={0.85}>
              <ChefHat size={20} color={activeTab === 'process' ? '#FFF' : '#000000'} />
              <Text style={[styles.optionText, activeTab === 'process' && styles.activeOptionText]}>{t("FoodDetailsScreen.Cooking_Steps")}</Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: Nutrition */}
          {activeTab === 'calories' && <View style={styles.resultCard}>
              <View style={styles.calorieBanner}>
                <LinearGradient colors={Theme.gradients.primary} style={styles.calorieGrad} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }}>
                  <Flame size={28} color="#FFFFFF" />
                  <Text style={styles.calorieValue}>{result.nutrition?.calories || result.calories || 0}</Text>
                  <Text style={styles.calorieLabel}>{t("FoodDetailsScreen.Est_Calories_kcal")}</Text>
                </LinearGradient>
              </View>

              <View style={styles.nutritionGrid}>
                {nutritionItems.map((n, i) => <View key={i} style={styles.nutriCard}>
                    <Text style={[styles.nutriValue, {
                color: n.color
              }]}>{n.value}</Text>
                    <Text style={styles.nutriLabel}>{n.label}</Text>
                  </View>)}
              </View>

              {result.dietary_info && result.dietary_info.length > 0 && <View style={styles.extraInfoSection}>
                  <Text style={styles.extraInfoTitle}>{t("FoodDetailsScreen.Dietary_Info")}</Text>
                  <View style={styles.ingredientsList}>
                    {result.dietary_info.map((diet, i) => <View key={i} style={styles.dietTag}>
                        <Text style={styles.dietTagText}>{diet}</Text>
                      </View>)}
                  </View>
                </View>}

              {result.allergens && result.allergens.length > 0 && result.allergens[0] !== "None" && <View style={styles.extraInfoSection}>
                  <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8
            }}>
                    <ShieldAlert size={16} color={Theme.colors.danger} />
                    <Text style={[styles.extraInfoTitle, {
                color: Theme.colors.danger,
                marginBottom: 0
              }]}>{t("FoodDetailsScreen.Allergen_Warning")}</Text>
                  </View>
                  <View style={styles.ingredientsList}>
                    {result.allergens.map((alg, i) => <View key={i} style={[styles.dietTag, styles.allergenTag]}>
                        <Text style={styles.allergenTagText}>{alg}</Text>
                      </View>)}
                  </View>
                </View>}
            </View>}

          {/* Tab 2: Cooking Steps */}
          {activeTab === 'process' && <View style={styles.resultCard}>
              <View style={styles.cardInner}>
                <Text style={styles.subHeader}>{t("FoodDetailsScreen.Ingredients_Required")}</Text>
                <View style={styles.ingredientsList}>
                  {result.ingredients?.map((ing, i) => <View key={i} style={styles.dietTag}>
                      <Text style={styles.dietTagText}>
                        {ing.name} {ing.amount ? `(${ing.amount})` : ''}
                      </Text>
                    </View>)}
                </View>

                <Text style={styles.subHeader}>{t("FoodDetailsScreen.Cooking_Steps_1")}{result.cooking_time || 'N/A'} • {result.difficulty || 'Normal'}):
                </Text>
                {(result.cooking_suggestions || result.making_process)?.map((stepItem, i) => <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{stepItem}</Text>
                  </View>)}
              </View>
            </View>}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  gradient: {
    flex: 1
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  emptyTitle: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: Theme.colors.text
  },
  backBtnEmpty: {
    marginTop: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xs
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.text
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 110
  },
  foodNameCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  foodIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.backgroundMid,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  foodEmoji: {
    fontSize: 32
  },
  foodNameLabel: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#6B7280',
    letterSpacing: 1.2
  },
  foodNameMain: {
    fontSize: 26,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#000000',
    marginTop: 4,
    textAlign: 'center'
  },
  foodDesc: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 8
  },
  weightTag: {
    backgroundColor: Theme.colors.backgroundMid,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6
  },
  weightText: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.textMuted
  },
  healthScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14
  },
  healthScoreText: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#065F46'
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  optionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...Theme.shadows.xs,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  activeOption: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary
  },
  optionText: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#000000'
  },
  activeOptionText: {
    color: '#FFF'
  },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 20,
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  cardInner: {
    gap: 12
  },
  calorieBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    ...Theme.shadows.sm
  },
  calorieGrad: {
    padding: 20,
    alignItems: 'center'
  },
  calorieValue: {
    fontSize: 44,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#FFF'
  },
  calorieLabel: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: 'rgba(255,255,255,0.85)'
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between'
  },
  nutriCard: {
    width: (width - 100) / 3,
    backgroundColor: Theme.colors.backgroundMid,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center'
  },
  nutriValue: {
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.heading
  },
  nutriLabel: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  extraInfoSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight
  },
  extraInfoTitle: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#000000',
    marginBottom: 8
  },
  subHeader: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#000000',
    marginTop: 12,
    marginBottom: 8
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  dietTag: {
    backgroundColor: Theme.colors.backgroundMid,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  dietTagText: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.text
  },
  allergenTag: {
    backgroundColor: Theme.colors.dangerLight
  },
  allergenTagText: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.danger
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
    alignItems: 'flex-start'
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.heading
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#111827',
    lineHeight: 22
  }
});
export default FoodDetailsScreen;