import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { recipeService, mealPlanService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Check, Calendar as CalendarIcon, Clock, Utensils, Sparkles } from 'lucide-react-native';
const MEAL_TYPES = [{
  label: 'Breakfast',
  emoji: '🌅',
  color: '#F59E0B',
  bg: '#FEF3C7'
}, {
  label: 'Lunch',
  emoji: '☀️',
  color: '#10B981',
  bg: '#D1FAE5'
}, {
  label: 'Dinner',
  emoji: '🌙',
  color: '#6366F1',
  bg: '#E0E7FF'
}, {
  label: 'Snack',
  emoji: '🍎',
  color: '#EF4444',
  bg: '#FEE2E2'
}];
const AddMealPlanScreen = ({
  navigation,
  route
}) => {
  const {
    t
  } = useTranslation();
  const {
    mealType: initialMealType,
    date: initialDate
  } = route.params || {};
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(1);
  const [selectedDay, setSelectedDay] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState(initialMealType || 'Breakfast');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [customMealName, setCustomMealName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', {
        weekday: 'short'
      }),
      date: d.toLocaleDateString('en-US', {
        day: 'numeric'
      }),
      value: d.toISOString().split('T')[0]
    });
  }
  useEffect(() => {
    const init = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.user_id || 1);
        }
        const response = await recipeService.getAll(userId);
        setRecipes(response.data || []);
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId]);
  const handleSave = async () => {
    if (!selectedRecipe && !customMealName.trim()) {
      Alert.alert('Error', 'Please select a recipe or enter a meal name.');
      return;
    }
    setSaving(true);
    try {
      const name = customMealName.trim() || selectedRecipe.name;
      const calories = customMealName.trim() ? parseInt(customCalories) || 0 : selectedRecipe.calories || 0;
      const payload = {
        name: `${selectedMealType} - ${name}`,
        plan_date: selectedDay,
        meal_type: selectedMealType,
        recipe_name: name,
        calories
      };
      await mealPlanService.createPlan(userId, payload);
      Alert.alert('Success', 'Meal added to your plan!', [{
        text: 'OK',
        onPress: () => navigation.goBack()
      }]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save meal plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  const activeMealType = MEAL_TYPES.find(m => m.label === selectedMealType);
  const canSave = selectedRecipe || customMealName.trim();
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t("AddMealPlanScreen.Add_Meal_Plan")}</Text>
            <Text style={styles.headerSub}>{t("AddMealPlanScreen.Plan_your_nutrition")}</Text>
          </View>
          <View style={{
          width: 44
        }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Picker */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <CalendarIcon size={17} color={Theme.colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>{t("AddMealPlanScreen.Select_Date")}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{
            gap: 10
          }}>
              {days.map((day, i) => <TouchableOpacity key={i} onPress={() => setSelectedDay(day.value)} activeOpacity={0.8}>
                  {selectedDay === day.value ? <LinearGradient colors={Theme.gradients.primary} style={styles.dayChipActive} start={{
                x: 0,
                y: 0
              }} end={{
                x: 1,
                y: 1
              }}>
                      <Text style={styles.dayLabelActive}>{day.label}</Text>
                      <Text style={styles.dayDateActive}>{day.date}</Text>
                    </LinearGradient> : <View style={styles.dayChip}>
                      <Text style={styles.dayLabel}>{day.label}</Text>
                      <Text style={styles.dayDate}>{day.date}</Text>
                    </View>}
                </TouchableOpacity>)}
            </ScrollView>
          </View>

          {/* Meal Type */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Clock size={17} color={Theme.colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>{t("AddMealPlanScreen.Meal_Type")}</Text>
            </View>
            <View style={styles.mealTypeGrid}>
              {MEAL_TYPES.map(type => <TouchableOpacity key={type.label} style={[styles.mealTypeChip, selectedMealType === type.label && {
              borderColor: type.color,
              borderWidth: 2
            }]} onPress={() => setSelectedMealType(type.label)} activeOpacity={0.8}>
                  <View style={[styles.mealTypeIconBg, {
                backgroundColor: type.bg
              }]}>
                    <Text style={styles.mealTypeEmoji}>{type.emoji}</Text>
                  </View>
                  <Text style={[styles.mealTypeLabel, selectedMealType === type.label && {
                color: type.color
              }]}>
                    {type.label}
                  </Text>
                  {selectedMealType === type.label && <View style={[styles.checkDot, {
                backgroundColor: type.color
              }]}>
                      <Check size={10} color="#FFF" strokeWidth={3} />
                    </View>}
                </TouchableOpacity>)}
            </View>
          </View>

          {/* Custom Meal */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Sparkles size={17} color={Theme.colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>{t("AddMealPlanScreen.Custom_Meal_Optional")}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.inputLabel}>{t("AddMealPlanScreen.Meal_Name")}</Text>
              <TextInput style={styles.input} placeholder={t("AddMealPlanScreen.placeholder_e_g_Avocado_Toast")} placeholderTextColor={Theme.colors.textPlaceholder} value={customMealName} onChangeText={text => {
              setCustomMealName(text);
              if (text) setSelectedRecipe(null);
            }} />
              <Text style={styles.inputLabel}>{t("AddMealPlanScreen.Estimated_Calories")}</Text>
              <TextInput style={[styles.input, {
              marginBottom: 0
            }]} placeholder={t("AddMealPlanScreen.placeholder_e_g_350")} placeholderTextColor={Theme.colors.textPlaceholder} keyboardType="numeric" value={customCalories} onChangeText={setCustomCalories} />
            </View>
          </View>

          {/* Recipe List */}
          <View style={[styles.section, {
          paddingBottom: 120
        }]}>
            <View style={styles.sectionTitleRow}>
              <Utensils size={17} color={Theme.colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>{t("AddMealPlanScreen.Select_a_Recipe")}</Text>
            </View>

            {loading ? <View style={styles.loaderRow}>
                <ActivityIndicator size="small" color={Theme.colors.primary} />
                <Text style={styles.loadingText}>{t("AddMealPlanScreen.Loading_recipes")}</Text>
              </View> : recipes.length === 0 ? <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>{t("AddMealPlanScreen.No_Recipes_Found")}</Text>
                <Text style={styles.emptyText}>{t("AddMealPlanScreen.Add_some_recipes_first_to_plan")}</Text>
              </View> : recipes.map((recipe, i) => <TouchableOpacity key={i} style={[styles.recipeRow, selectedRecipe?.id === recipe.id && styles.recipeRowActive]} onPress={() => {
            setSelectedRecipe(recipe);
            setCustomMealName('');
            setCustomCalories('');
          }} activeOpacity={0.85}>
                  <View style={styles.recipeEmoji}>
                    <Text style={{
                fontSize: 22
              }}>🍜</Text>
                  </View>
                  <View style={{
              flex: 1
            }}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <Text style={styles.recipeMeta}>{recipe.calories}{t("AddMealPlanScreen.kcal")}{recipe.difficulty}</Text>
                  </View>
                  {selectedRecipe?.id === recipe.id && <LinearGradient colors={Theme.gradients.primary} style={styles.checkCircle} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }}>
                      <Check size={14} color="#FFF" strokeWidth={3} />
                    </LinearGradient>}
                </TouchableOpacity>)}
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSave} disabled={saving || !canSave} activeOpacity={0.88} style={[styles.saveBtn, (!canSave || saving) && {
          opacity: 0.5
        }]}>
            <LinearGradient colors={Theme.gradients.primary} style={styles.saveBtnGrad} start={{
            x: 0,
            y: 0
          }} end={{
            x: 1,
            y: 0
          }}>
              {saving ? <ActivityIndicator color="#FFF" /> : <>
                  <Text style={styles.saveBtnText}>{t("AddMealPlanScreen.Add_to_Meal_Plan")}</Text>
                  {activeMealType && <Text style={{
                fontSize: 18
              }}>{activeMealType.emoji}</Text>}
                </>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xs
  },
  headerCenter: {
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: Theme.colors.text,
    letterSpacing: -0.3
  },
  headerSub: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8
  },
  section: {
    marginBottom: 28
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 17,
    color: Theme.colors.text
  },
  // Date chips
  dayChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 68,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadows.xs
  },
  dayChipActive: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 68,
    ...Theme.shadows.sm
  },
  dayLabel: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  dayLabelActive: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  dayDate: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: Theme.colors.text,
    marginTop: 2
  },
  dayDateActive: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: Theme.colors.card,
    marginTop: 2
  },
  // Meal type grid
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  mealTypeChip: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    width: '46%',
    borderWidth: 1.5,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadows.xs,
    position: 'relative'
  },
  mealTypeIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  mealTypeEmoji: {
    fontSize: 22
  },
  mealTypeLabel: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: Theme.colors.text
  },
  checkDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadows.sm
  },
  inputLabel: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  input: {
    backgroundColor: Theme.colors.backgroundMid,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: Theme.colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  // Recipe rows
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20
  },
  loadingText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted
  },
  emptyBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    ...Theme.shadows.xs
  },
  emptyEmoji: {
    fontSize: 40
  },
  emptyTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 17,
    color: Theme.colors.text
  },
  emptyText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: Theme.colors.textMuted,
    textAlign: 'center'
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Theme.colors.borderLight,
    gap: 12,
    ...Theme.shadows.xs
  },
  recipeRowActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight + '20'
  },
  recipeEmoji: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center'
  },
  recipeName: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 15,
    color: Theme.colors.text
  },
  recipeMeta: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 3
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: 'rgba(248,250,252,0.95)',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight
  },
  saveBtn: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    ...Theme.shadows.md
  },
  saveBtnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderRadius: Theme.borderRadius.xl
  },
  saveBtnText: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 17,
    color: Theme.colors.card
  }
});
export default AddMealPlanScreen;