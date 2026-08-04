import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { mealPlanService, settingsService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar as CalendarIcon, ChevronRight, Clock, Utensils, Sparkles, RefreshCw, CheckCircle2, Circle, Flame, Droplets, Wheat, X, Settings as SettingsIcon } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const MealPlannerScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(1);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [mealItems, setMealItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editForm, setEditForm] = useState({
    meal_name: '',
    cooking_time: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  const [prefsModal, setPrefsModal] = useState(false);
  const [prefsForm, setPrefsForm] = useState({
    health_goal: '',
    cuisine_preferences: '',
    disliked_foods: '',
    cooking_time_preference: '30'
  });
  
  const weekDays = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    weekDays.push({
      fullDate: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', {
        weekday: 'short'
      }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', {
        month: 'short'
      })
    });
  }
  
  const fetchPlan = async () => {
    try {
      const response = await mealPlanService.getPlanByDate(userId, selectedDate);
      if (response.data) {
        setCurrentPlan(response.data);
        const itemsRes = await mealPlanService.getItems(response.data.id);
        setMealItems(itemsRes.data || []);
      } else {
        setCurrentPlan(null);
        setMealItems([]);
      }
    } catch (error) {
      console.error("Error fetching meal plan:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useFocusEffect(useCallback(() => {
    const init = async () => {
      const userData = await AsyncStorage.getItem('userData');
      let uid = 1;
      if (userData) {
        const user = JSON.parse(userData);
        uid = user.user_id || 1;
        setUserId(uid);
      }
      fetchPlan();
      try {
        const sRes = await settingsService.get(uid);
        if (sRes.data) {
          setPrefsForm({
            health_goal: sRes.data.health_goal || '',
            cuisine_preferences: Array.isArray(sRes.data.cuisine_preferences) ? sRes.data.cuisine_preferences.join(', ') : '',
            disliked_foods: Array.isArray(sRes.data.disliked_foods) ? sRes.data.disliked_foods.join(', ') : '',
            cooking_time_preference: sRes.data.cooking_time_preference ? String(sRes.data.cooking_time_preference) : '30'
          });
        }
      } catch (e) {}
    };
    setLoading(true);
    init();
  }, [userId, selectedDate]));
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchPlan();
  };
  
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await mealPlanService.generatePlan(userId, selectedDate);
      if (response.data) {
        setCurrentPlan(response.data);
        const itemsRes = await mealPlanService.getItems(response.data.id);
        setMealItems(itemsRes.data || []);
      }
    } catch (error) {
      Alert.alert("Generation Failed", "Could not generate AI meal plan.");
    } finally {
      setGenerating(false);
    }
  };
  
  const handleReplace = async mealType => {
    if (!currentPlan) return;
    setGenerating(true);
    try {
      const response = await mealPlanService.replaceMeal(userId, currentPlan.id, mealType);
      if (response.data) {
        fetchPlan(); 
      }
    } catch (error) {
      Alert.alert("Replacement Failed", "Could not replace meal.");
    } finally {
      setGenerating(false);
    }
  };
  
  const toggleComplete = async item => {
    try {
      const prevItems = [...mealItems];
      setMealItems(prevItems.map(i => i.id === item.id ? {
        ...i,
        completed: !i.completed
      } : i));
      await mealPlanService.completeItem(item.id);
    } catch (error) {
      Alert.alert("Error", "Could not update status.");
      fetchPlan();
    }
  };
  
  const handleEditClick = () => {
    setEditForm({
      meal_name: selectedItem.meal_name || '',
      cooking_time: String(selectedItem.cooking_time || 0),
      calories: String(selectedItem.nutrition?.calories || 0),
      protein: String(selectedItem.nutrition?.protein || 0),
      carbs: String(selectedItem.nutrition?.carbs || 0),
      fat: String(selectedItem.nutrition?.fat || 0)
    });
    setIsEditingItem(true);
  };
  
  const handleSaveEdit = async () => {
    try {
      const data = {
        meal_name: editForm.meal_name,
        cooking_time: parseInt(editForm.cooking_time) || 0,
        nutrition: {
          calories: parseInt(editForm.calories) || 0,
          protein: parseInt(editForm.protein) || 0,
          carbs: parseInt(editForm.carbs) || 0,
          fat: parseInt(editForm.fat) || 0
        }
      };
      await mealPlanService.updateItem(selectedItem.id, data);
      setIsEditingItem(false);
      setSelectedItem(null);
      fetchPlan();
      Alert.alert("Success", "Meal item updated!");
    } catch (e) {
      Alert.alert("Error", "Could not update meal item.");
    }
  };
  
  const savePreferences = async () => {
    try {
      await settingsService.update(userId, {
        health_goal: prefsForm.health_goal,
        cuisine_preferences: prefsForm.cuisine_preferences.split(',').map(s => s.trim()).filter(Boolean),
        disliked_foods: prefsForm.disliked_foods.split(',').map(s => s.trim()).filter(Boolean),
        cooking_time_preference: parseInt(prefsForm.cooking_time_preference) || 30
      });
      setPrefsModal(false);
      Alert.alert("Success", "Preferences updated!");
    } catch (e) {
      Alert.alert("Error", "Could not save preferences.");
    }
  };
  
  const renderMacro = (icon, label, value, color) => (
    <View style={styles.macroBox}>
      {icon}
      <Text style={styles.macroValue}>{value}{t("MealPlannerScreen.g")}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
  
  const renderMealCard = type => {
    const item = mealItems.find(m => m.meal_type.toLowerCase() === type.toLowerCase());
    return (
      <View key={type} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTypeLabel}>{type}</Text>
          {item && (
            <TouchableOpacity onPress={() => handleReplace(type)} style={styles.replaceBtn}>
              <RefreshCw size={14} color="#000000" />
              <Text style={styles.replaceBtnText}>{t("MealPlannerScreen.Replace_AI")}</Text>
            </TouchableOpacity>
          )}
        </View>

        {item ? (
          <TouchableOpacity style={[styles.mealCard, item.completed && styles.mealCardCompleted]} onPress={() => setSelectedItem(item)} activeOpacity={0.7}>
            <TouchableOpacity onPress={() => toggleComplete(item)} style={styles.checkBtn}>
              {item.completed ? <CheckCircle2 size={24} color="#10b981" /> : <Circle size={24} color="#cccccc" />}
            </TouchableOpacity>
            
            <View style={styles.mealInfo}>
              <Text style={[styles.recipeName, item.completed && styles.textStrike]}>{item.meal_name}</Text>
              <View style={styles.recipeMetaRow}>
                <Clock size={12} color="#000000" />
                <Text style={styles.recipeMeta}>{item.cooking_time}{t("MealPlannerScreen.min")}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Flame size={12} color="#f97316" />
                <Text style={styles.recipeMeta}>{item.nutrition?.calories || 0}{t("MealPlannerScreen.kcal")}</Text>
              </View>
            </View>
            
            <ChevronRight size={18} color="#000000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyMealCard}>
            <Text style={styles.emptyMealText}>{t("MealPlannerScreen.No")} {type} {t("MealPlannerScreen.planned")}</Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.prefBtn} onPress={() => setPrefsModal(true)}>
           <SettingsIcon size={32} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("MealPlannerScreen.Meal_Planner")}</Text>
        <Text style={styles.headerSubtitle}>{t("MealPlannerScreen.AI_personalized_for_you")}</Text>
      </View>

      {/* Date Strip */}
      <View style={styles.dateStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {weekDays.map((day, i) => {
            const isSelected = selectedDate === day.fullDate;
            return (
              <TouchableOpacity key={i} style={[styles.dateChip, isSelected && styles.activeDateChip]} onPress={() => setSelectedDate(day.fullDate)} activeOpacity={0.85}>
                <Text style={[styles.dateDay, isSelected && styles.activeText]}>{day.dayName}</Text>
                <Text style={[styles.dateNum, isSelected && styles.activeText]}>{day.dayNum}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />} showsVerticalScrollIndicator={false}>
          {generating ? (
            <View style={styles.generatingBox}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.generatingTitle}>{t("MealPlannerScreen.AI_is_thinking")}</Text>
              <Text style={styles.generatingSub}>{t("MealPlannerScreen.Crafting_your_perfect_meal_pla")}</Text>
            </View>
          ) : currentPlan ? (
            <>
              {/* Macro Summary */}
              <View style={styles.macroSummaryContainer}>
                <View style={styles.calorieBox}>
                  <Text style={styles.calorieValue}>{currentPlan.total_calories || 0}</Text>
                  <Text style={styles.calorieLabel}>{t("MealPlannerScreen.kcal_total")}</Text>
                </View>
                <View style={styles.macrosRow}>
                  {renderMacro(<Wheat size={16} color="#000000" />, "Carbs", currentPlan.total_carbs || 0)}
                  {renderMacro(<Droplets size={16} color="#000000" />, "Protein", currentPlan.total_protein || 0)}
                  {renderMacro(<Flame size={16} color="#000000" />, "Fats", currentPlan.total_fats || 0)}
                </View>
              </View>

              {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(type => renderMealCard(type))}
            </>
          ) : (
            <View style={styles.emptyStateBox}>
              <View style={styles.aiCircle}>
                <Sparkles size={32} color="#000000" />
              </View>
              <Text style={styles.emptyTitle}>{t("MealPlannerScreen.No_Plan_for_Today")}</Text>
              <Text style={styles.emptySub}>{t("MealPlannerScreen.Let_AI_craft_a_personalized_me")}</Text>
              <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
                <Text style={styles.generateBtnText}>{t("MealPlannerScreen.Generate_AI_Plan")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Meal Details Modal */}
      {selectedItem && (
        <Modal animationType="slide" transparent={true} visible={true} onRequestClose={() => setSelectedItem(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedItem.meal_type}</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  {!isEditingItem && (
                    <TouchableOpacity onPress={handleEditClick}>
                      <Text style={{ color: '#000000', fontFamily: Theme.typography.fontFamily.bodySemiBold }}>
                        {t("MealPlannerScreen.Edit")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => {
                    setSelectedItem(null);
                    setIsEditingItem(false);
                  }}>
                    <X size={24} color="#000000" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {isEditingItem ? (
                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.inputLabel}>{t("MealPlannerScreen.Meal_Name")}</Text>
                  <View style={styles.inputBox}>
                    <TextInput value={editForm.meal_name} onChangeText={t => setEditForm({ ...editForm, meal_name: t })} style={styles.inputText} />
                  </View>

                  <Text style={styles.inputLabel}>{t("MealPlannerScreen.Cooking_Time_mins")}</Text>
                  <View style={styles.inputBox}>
                    <TextInput keyboardType="numeric" value={editForm.cooking_time} onChangeText={t => setEditForm({ ...editForm, cooking_time: t })} style={styles.inputText} />
                  </View>

                  <Text style={styles.inputLabel}>{t("MealPlannerScreen.Calories")}</Text>
                  <View style={styles.inputBox}>
                    <TextInput keyboardType="numeric" value={editForm.calories} onChangeText={t => setEditForm({ ...editForm, calories: t })} style={styles.inputText} />
                  </View>

                  <Text style={styles.inputLabel}>{t("MealPlannerScreen.Protein_g")}</Text>
                  <View style={styles.inputBox}>
                    <TextInput keyboardType="numeric" value={editForm.protein} onChangeText={t => setEditForm({ ...editForm, protein: t })} style={styles.inputText} />
                  </View>

                  <Text style={styles.inputLabel}>{t("MealPlannerScreen.Carbs_g")}</Text>
                  <View style={styles.inputBox}>
                    <TextInput keyboardType="numeric" value={editForm.carbs} onChangeText={t => setEditForm({ ...editForm, carbs: t })} style={styles.inputText} />
                  </View>

                  <Text style={styles.inputLabel}>{t("MealPlannerScreen.Fat_g")}</Text>
                  <View style={styles.inputBox}>
                    <TextInput keyboardType="numeric" value={editForm.fat} onChangeText={t => setEditForm({ ...editForm, fat: t })} style={styles.inputText} />
                  </View>

                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                     <Text style={styles.saveBtnText}>{t("MealPlannerScreen.Save_Changes")}</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                <>
                  <Text style={styles.modalMealName}>{selectedItem.meal_name}</Text>
                  
                  <View style={styles.modalMacroRow}>
                    <Text style={styles.modalMacroText}>{selectedItem.nutrition?.calories || 0}{t("MealPlannerScreen.kcal")}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.modalMacroText}>{selectedItem.nutrition?.protein || 0}{t("MealPlannerScreen.g_Pro")}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.modalMacroText}>{selectedItem.nutrition?.carbs || 0}{t("MealPlannerScreen.g_Carb")}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.modalMacroText}>{selectedItem.nutrition?.fat || 0}{t("MealPlannerScreen.g_Fat")}</Text>
                  </View>
                  
                  <ScrollView style={styles.modalScroll}>
                    <Text style={styles.sectionTitle}>{t("MealPlannerScreen.Ingredients")}</Text>
                    {selectedItem.ingredients && selectedItem.ingredients.map((ing, idx) => (
                      <View key={idx} style={styles.ingredientRow}>
                        <Circle size={8} color="#000000" style={{ marginRight: 8 }} />
                        <Text style={styles.ingredientText}>{ing.quantity} {ing.unit} {ing.name}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Preferences Modal */}
      {prefsModal && (
        <Modal animationType="slide" transparent={true} visible={true} onRequestClose={() => setPrefsModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("MealPlannerScreen.AI_Meal_Preferences")}</Text>
                <TouchableOpacity onPress={() => setPrefsModal(false)}>
                  <X size={24} color="#000000" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>{t("MealPlannerScreen.Health_Goal_e_g_Weight_Loss")}</Text>
                <View style={styles.inputBox}>
                  <TextInput value={prefsForm.health_goal} onChangeText={t => setPrefsForm({ ...prefsForm, health_goal: t })} style={styles.inputText} placeholder={t("MealPlannerScreen.placeholder_Weight_Loss")} placeholderTextColor="#999" />
                </View>
                
                <Text style={styles.inputLabel}>{t("MealPlannerScreen.Cuisines_comma_separated")}</Text>
                <View style={styles.inputBox}>
                  <TextInput value={prefsForm.cuisine_preferences} onChangeText={t => setPrefsForm({ ...prefsForm, cuisine_preferences: t })} style={styles.inputText} placeholder={t("MealPlannerScreen.placeholder_Italian_Mexican_As")} placeholderTextColor="#999" />
                </View>
                
                <Text style={styles.inputLabel}>{t("MealPlannerScreen.Disliked_Foods_comma_separate")}</Text>
                <View style={styles.inputBox}>
                  <TextInput value={prefsForm.disliked_foods} onChangeText={t => setPrefsForm({ ...prefsForm, disliked_foods: t })} style={styles.inputText} placeholder={t("MealPlannerScreen.placeholder_Mushrooms_Olives")} placeholderTextColor="#999" />
                </View>
                
                <Text style={styles.inputLabel}>{t("MealPlannerScreen.Max_Cooking_Time_per_Meal_min")}</Text>
                <View style={styles.inputBox}>
                  <TextInput value={prefsForm.cooking_time_preference} onChangeText={t => setPrefsForm({ ...prefsForm, cooking_time_preference: t })} style={styles.inputText} keyboardType="numeric" placeholder="30" placeholderTextColor="#999" />
                </View>
              </ScrollView>
              
              <TouchableOpacity style={styles.saveBtn} onPress={savePreferences}>
                 <Text style={styles.saveBtnText}>{t("MealPlannerScreen.Save_Preferences")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10b981' // Green background
  },
  header: {
    alignItems: 'center', // Centered header for settings logo
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#000000', // Black text
    letterSpacing: -0.5,
    marginTop: 8
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#000000', // Black text
    marginTop: 2
  },
  prefBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff', // White circular background for logo to pop on green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  dateStrip: {
    paddingBottom: 20
  },
  dateScroll: {
    paddingHorizontal: 24,
    gap: 12
  },
  dateChip: {
    width: 54,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#ffffff', // White boxes
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  activeDateChip: {
    backgroundColor: '#000000', // Black active box
  },
  dateDay: {
    fontSize: 12,
    color: '#000000', // Black text
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  dateNum: {
    fontSize: 18,
    color: '#000000', // Black text
    fontFamily: Theme.typography.fontFamily.heading,
    marginTop: 4
  },
  activeText: {
    color: '#ffffff' // White text when active
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 110
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  macroSummaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff', // White box
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  calorieBox: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#eeeeee',
    paddingRight: 16
  },
  calorieValue: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#000000' // Black text
  },
  calorieLabel: {
    fontSize: 13,
    color: '#000000', // Black text
    fontFamily: Theme.typography.fontFamily.body,
    marginTop: 4
  },
  macrosRow: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 16
  },
  macroBox: {
    alignItems: 'center'
  },
  macroValue: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#000000', // Black text
    marginTop: 6
  },
  macroLabel: {
    fontSize: 11,
    color: '#000000', // Black text
    fontFamily: Theme.typography.fontFamily.body,
    marginTop: 2
  },
  mealSection: {
    marginBottom: 20
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  mealTypeLabel: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#000000' // Black text
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff', // White box
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  replaceBtnText: {
    fontSize: 12,
    color: '#000000', // Black text
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White box
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  mealCardCompleted: {
    opacity: 0.6
  },
  checkBtn: {
    marginRight: 14
  },
  mealInfo: {
    flex: 1
  },
  recipeName: {
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#000000', // Black text
    marginBottom: 4
  },
  textStrike: {
    textDecorationLine: 'line-through',
    color: '#666666'
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  recipeMeta: {
    fontSize: 13,
    color: '#000000', // Black text
    fontFamily: Theme.typography.fontFamily.body
  },
  metaDot: {
    fontSize: 12,
    color: '#000000', // Black text
    marginHorizontal: 4
  },
  emptyMealCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)' // White semi-transparent box
  },
  emptyMealText: {
    color: '#000000', // Black text
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body
  },
  generatingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  generatingTitle: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#000000', // Black text
    marginTop: 20
  },
  generatingSub: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#000000', // Black text
    marginTop: 8
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  aiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff', // White circle
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#000000', // Black text
    marginBottom: 12
  },
  emptySub: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#000000', // Black text
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 32
  },
  generateBtn: {
    backgroundColor: '#000000', // Black button
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  generateBtnText: {
    color: '#ffffff', // White text on black button
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 14,
    color: '#000000', // Black text
    fontFamily: Theme.typography.fontFamily.heading,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  modalMealName: {
    fontSize: 24,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#000000', // Black text
    marginBottom: 12
  },
  modalMacroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24
  },
  modalMacroText: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#000000' // Black text
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#000000', // Black text
    marginBottom: 16
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  ingredientText: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#000000' // Black text
  },
  inputLabel: {
    fontSize: 13,
    color: '#000000', // Black text
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    marginBottom: 6,
    marginTop: 14
  },
  inputBox: {
    backgroundColor: '#ffffff', // White box
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cccccc',
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  inputText: {
    fontSize: 15,
    color: '#000000', // Black text
    fontFamily: Theme.typography.fontFamily.body
  },
  saveBtn: {
    backgroundColor: '#000000', // Black button
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20
  },
  saveBtnText: {
    color: '#ffffff', // White text
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  }
});

export default MealPlannerScreen;