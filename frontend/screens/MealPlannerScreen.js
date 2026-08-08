import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { mealPlanService, settingsService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar as CalendarIcon, ChevronRight, Clock, Utensils, Sparkles, RefreshCw, CheckCircle2, Circle, Flame, Droplets, Wheat, X, Settings as SettingsIcon, Target, Globe, Ban, Sliders, Check } from 'lucide-react-native';
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
  
  const getMealColors = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'breakfast': return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: '#f59e0b' }; 
      case 'lunch': return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: '#10b981' };
      case 'snack': return { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', icon: '#a855f7' };
      case 'dinner': return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', icon: '#3b82f6' };
      default: return { bg: 'rgba(30, 41, 59, 0.75)', border: 'rgba(255, 255, 255, 0.12)', icon: '#ffffff' };
    }
  };
  
  const renderMacro = (icon, label, value) => (
    <View style={styles.macroBox}>
      {icon}
      <Text style={styles.macroValue}>{value}{t("MealPlannerScreen.g")}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
  
  const renderMealCard = type => {
    const item = mealItems.find(m => m.meal_type.toLowerCase() === type.toLowerCase());
    const colors = getMealColors(type);
    
    return (
      <View key={type} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 8, height: 24, backgroundColor: colors.icon, borderRadius: 4 }} />
            <Text style={styles.mealTypeLabel}>{type}</Text>
          </View>
          {item && (
            <TouchableOpacity onPress={() => handleReplace(type)} style={[styles.replaceBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <RefreshCw size={14} color={colors.icon} />
              <Text style={[styles.replaceBtnText, { color: colors.icon }]}>{t("MealPlannerScreen.Replace_AI")}</Text>
            </TouchableOpacity>
          )}
        </View>

        {item ? (
          <TouchableOpacity style={[styles.mealCard, { backgroundColor: colors.bg, borderColor: colors.border }, item.completed && styles.mealCardCompleted]} onPress={() => setSelectedItem(item)} activeOpacity={0.7}>
            <TouchableOpacity onPress={() => toggleComplete(item)} style={styles.checkBtn}>
              {item.completed ? <CheckCircle2 size={24} color={colors.icon} /> : <Circle size={24} color={colors.border} />}
            </TouchableOpacity>
            
            <View style={styles.mealInfo}>
              <Text style={[styles.recipeName, item.completed && styles.textStrike, { color: colors.icon }]}>{item.meal_name}</Text>
              <View style={styles.recipeMetaRow}>
                <Clock size={12} color="#94a3b8" />
                <Text style={styles.recipeMeta}>{item.cooking_time}{t("MealPlannerScreen.min")}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Flame size={12} color="#f97316" />
                <Text style={styles.recipeMeta}>{item.nutrition?.calories || 0}{t("MealPlannerScreen.kcal")}</Text>
              </View>
            </View>
            
            <ChevronRight size={18} color={colors.icon} />
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient 
        colors={Theme.gradients.background} 
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              style={styles.headerIconBtn} 
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main'))}
              activeOpacity={0.7}
            >
              <X size={20} color="#000000" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.headerIconBtn} 
              onPress={() => setPrefsModal(true)}
              activeOpacity={0.7}
            >
              <SettingsIcon size={20} color="#000000" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
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
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />} showsVerticalScrollIndicator={false}>
            {generating ? (
              <View style={styles.generatingBox}>
                <ActivityIndicator size="large" color="#10b981" />
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
                    {renderMacro(<Wheat size={16} color="#34d399" />, "Carbs", currentPlan.total_carbs || 0)}
                    {renderMacro(<Droplets size={16} color="#60a5fa" />, "Protein", currentPlan.total_protein || 0)}
                    {renderMacro(<Flame size={16} color="#f97316" />, "Fats", currentPlan.total_fats || 0)}
                  </View>
                </View>

                {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(type => renderMealCard(type))}
              </>
            ) : (
              <View style={styles.emptyStateBox}>
                <View style={styles.aiCircle}>
                  <Sparkles size={36} color="#34d399" />
                </View>
                <Text style={styles.emptyTitle}>{t("MealPlannerScreen.No_Plan_for_Today")}</Text>
                <Text style={styles.emptySub}>{t("MealPlannerScreen.Let_AI_craft_a_personalized_me")}</Text>
                <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.85}>
                  <LinearGradient colors={['#10b981', '#059669']} style={styles.generateBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Sparkles size={18} color="#ffffff" />
                    <Text style={styles.generateBtnText}>{t("MealPlannerScreen.Generate_AI_Plan")}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

      {/* Meal Details Modal */}
      {selectedItem && (
        <Modal animationType="slide" transparent={true} visible={true} onRequestClose={() => setSelectedItem(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { borderColor: getMealColors(selectedItem.meal_type).border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: getMealColors(selectedItem.meal_type).icon }]}>{selectedItem.meal_type}</Text>
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
                    <X size={24} color="#ffffff" />
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
                  <Text style={[styles.modalMealName, { color: getMealColors(selectedItem.meal_type).icon }]}>{selectedItem.meal_name}</Text>
                  
                  <View style={[styles.modalMacroRow, { backgroundColor: getMealColors(selectedItem.meal_type).bg, borderColor: getMealColors(selectedItem.meal_type).border }]}>
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
            <View style={styles.colorfulModalContent}>
              {/* Header */}
              <LinearGradient colors={['#059669', '#10b981']} style={styles.modalHeroHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style={styles.modalHeaderTop}>
                  <View style={styles.modalHeaderBadge}>
                    <Sparkles size={16} color="#fef08a" />
                    <Text style={styles.modalHeaderBadgeText}>AI Settings</Text>
                  </View>
                  <TouchableOpacity onPress={() => setPrefsModal(false)} style={styles.closeBtnCircle} activeOpacity={0.8}>
                    <X size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalHeroTitle}>{t("MealPlannerScreen.AI_Meal_Preferences", "AI Meal Preferences")}</Text>
                <Text style={styles.modalHeroSubtitle}>Customize your health goals & food choices</Text>
              </LinearGradient>
              
              <ScrollView style={styles.prefsScroll} showsVerticalScrollIndicator={false}>
                {/* Health Goal */}
                <View style={[styles.prefCard, { borderColor: '#10b981', backgroundColor: '#f0fdf4' }]}>
                  <View style={styles.prefCardHeader}>
                    <View style={[styles.prefIconBox, { backgroundColor: '#dcfce7' }]}>
                      <Target size={18} color="#059669" />
                    </View>
                    <Text style={[styles.prefLabel, { color: '#065f46' }]}>{t("MealPlannerScreen.Health_Goal_e_g_Weight_Loss", "Health Goal")}</Text>
                  </View>
                  <TextInput 
                    value={prefsForm.health_goal} 
                    onChangeText={t => setPrefsForm({ ...prefsForm, health_goal: t })} 
                    style={[styles.prefInput, { color: '#064e3b', borderColor: '#a7f3d0' }]} 
                    placeholder={t("MealPlannerScreen.placeholder_Weight_Loss", "e.g. Weight Loss")} 
                    placeholderTextColor="#6ee7b7" 
                  />
                  <View style={styles.chipsRow}>
                    {['Weight Loss 🏋️', 'Muscle Gain 💪', 'Keto 🥑', 'Balanced 🥗'].map((chip, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={[styles.presetChip, { backgroundColor: '#ffffff', borderColor: '#86efac' }]}
                        onPress={() => setPrefsForm({ ...prefsForm, health_goal: chip.split(' ')[0] })}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, { color: '#047857' }]}>{chip}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Cuisines */}
                <View style={[styles.prefCard, { borderColor: '#f97316', backgroundColor: '#fff7ed' }]}>
                  <View style={styles.prefCardHeader}>
                    <View style={[styles.prefIconBox, { backgroundColor: '#ffedd5' }]}>
                      <Globe size={18} color="#ea580c" />
                    </View>
                    <Text style={[styles.prefLabel, { color: '#9a3412' }]}>{t("MealPlannerScreen.Cuisines_comma_separated", "Cuisine Preferences")}</Text>
                  </View>
                  <TextInput 
                    value={prefsForm.cuisine_preferences} 
                    onChangeText={t => setPrefsForm({ ...prefsForm, cuisine_preferences: t })} 
                    style={[styles.prefInput, { color: '#7c2d12', borderColor: '#fed7aa' }]} 
                    placeholder={t("MealPlannerScreen.placeholder_Italian_Mexican_As", "e.g. Italian, Mexican")} 
                    placeholderTextColor="#fdba74" 
                  />
                  <View style={styles.chipsRow}>
                    {['Italian 🇮🇹', 'Indian 🇮🇳', 'Mexican 🇲🇽', 'Asian 🥢'].map((chip, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={[styles.presetChip, { backgroundColor: '#ffffff', borderColor: '#fdba74' }]}
                        onPress={() => {
                          const val = chip.split(' ')[0];
                          const cur = prefsForm.cuisine_preferences ? prefsForm.cuisine_preferences + ', ' + val : val;
                          setPrefsForm({ ...prefsForm, cuisine_preferences: cur });
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, { color: '#c2410c' }]}>+ {chip}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Disliked Foods */}
                <View style={[styles.prefCard, { borderColor: '#f43f5e', backgroundColor: '#fff1f2' }]}>
                  <View style={styles.prefCardHeader}>
                    <View style={[styles.prefIconBox, { backgroundColor: '#ffe4e6' }]}>
                      <Ban size={18} color="#e11d48" />
                    </View>
                    <Text style={[styles.prefLabel, { color: '#9f1239' }]}>{t("MealPlannerScreen.Disliked_Foods_comma_separate", "Disliked Foods & Allergies")}</Text>
                  </View>
                  <TextInput 
                    value={prefsForm.disliked_foods} 
                    onChangeText={t => setPrefsForm({ ...prefsForm, disliked_foods: t })} 
                    style={[styles.prefInput, { color: '#881337', borderColor: '#fecdd3' }]} 
                    placeholder={t("MealPlannerScreen.placeholder_Mushrooms_Olives", "e.g. Mushrooms, Olives")} 
                    placeholderTextColor="#fda4af" 
                  />
                </View>
                
                {/* Max Cooking Time */}
                <View style={[styles.prefCard, { borderColor: '#3b82f6', backgroundColor: '#eff6ff' }]}>
                  <View style={styles.prefCardHeader}>
                    <View style={[styles.prefIconBox, { backgroundColor: '#dbeafe' }]}>
                      <Clock size={18} color="#2563eb" />
                    </View>
                    <Text style={[styles.prefLabel, { color: '#1e40af' }]}>{t("MealPlannerScreen.Max_Cooking_Time_per_Meal_min", "Max Cooking Time (mins)")}</Text>
                  </View>
                  <TextInput 
                    value={prefsForm.cooking_time_preference} 
                    onChangeText={t => setPrefsForm({ ...prefsForm, cooking_time_preference: t })} 
                    style={[styles.prefInput, { color: '#1e3a8a', borderColor: '#bfdbfe' }]} 
                    keyboardType="numeric" 
                    placeholder="30" 
                    placeholderTextColor="#93c5fd" 
                  />
                  <View style={styles.chipsRow}>
                    {['15 min ⚡', '30 min ⏱️', '45 min 🍳', '60 min 🍲'].map((chip, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={[styles.presetChip, { backgroundColor: '#ffffff', borderColor: '#93c5fd' }]}
                        onPress={() => setPrefsForm({ ...prefsForm, cooking_time_preference: chip.split(' ')[0] })}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, { color: '#1d4ed8' }]}>{chip}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.savePrefBtnContainer}>
                <TouchableOpacity style={styles.savePrefBtn} onPress={savePreferences} activeOpacity={0.88}>
                  <LinearGradient colors={['#10b981', '#059669']} style={styles.savePrefGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Check size={20} color="#ffffff" strokeWidth={2.5} />
                    <Text style={styles.savePrefBtnText}>{t("MealPlannerScreen.Save_Preferences", "Save Preferences")}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  backgroundGradient: {
    flex: 1,
  },
  glowOrb1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#10b981', // Solid vibrant green background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#94a3b8',
    marginTop: 2,
  },
  dateStrip: {
    paddingBottom: 16,
  },
  dateScroll: {
    paddingHorizontal: 24,
    gap: 10,
  },
  dateChip: {
    width: 54,
    height: 68,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDateChip: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  dateDay: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
  dateNum: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: Theme.typography.fontFamily.heading,
    marginTop: 4,
  },
  activeText: {
    color: '#ffffff',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 110,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroSummaryContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 18,
    marginBottom: 24,
    alignItems: 'center',
  },
  calorieBox: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    paddingRight: 16,
  },
  calorieValue: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#34d399',
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    marginTop: 2,
  },
  macrosRow: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 12,
  },
  macroBox: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#ffffff',
    marginTop: 6,
  },
  macroLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: Theme.typography.fontFamily.body,
    marginTop: 2,
  },
  mealSection: {
    marginBottom: 20,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealTypeLabel: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  replaceBtnText: {
    fontSize: 12,
    color: '#34d399',
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  mealCardCompleted: {
    opacity: 0.55,
  },
  checkBtn: {
    marginRight: 14,
  },
  mealInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#ffffff',
    marginBottom: 4,
  },
  textStrike: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMeta: {
    fontSize: 13,
    color: '#94a3b8',
    fontFamily: Theme.typography.fontFamily.body,
  },
  metaDot: {
    fontSize: 12,
    color: '#64748b',
    marginHorizontal: 4,
  },
  emptyMealCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
  },
  emptyMealText: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
  },
  generatingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  generatingTitle: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
    marginTop: 20,
  },
  generatingSub: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#94a3b8',
    marginTop: 8,
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  aiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
    marginBottom: 10,
  },
  emptySub: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  generateBtn: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
  },
  generateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 14,
    color: '#34d399',
    fontFamily: Theme.typography.fontFamily.heading,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalMealName: {
    fontSize: 24,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
    marginBottom: 12,
  },
  modalMacroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  modalMacroText: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
    marginBottom: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientText: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#e2e8f0',
  },
  inputLabel: {
    fontSize: 13,
    color: '#34d399',
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    marginBottom: 6,
    marginTop: 14,
  },
  inputBox: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputText: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: Theme.typography.fontFamily.body,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
  colorfulModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10
  },
  modalHeroHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  modalHeaderBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  closeBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalHeroTitle: {
    fontSize: 22,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
    letterSpacing: -0.3
  },
  modalHeroSubtitle: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.body,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2
  },
  prefsScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    maxHeight: 400
  },
  prefCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  prefCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  prefIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  prefLabel: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  prefInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.body
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1
  },
  chipText: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  savePrefBtnContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  savePrefBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4
  },
  savePrefGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8
  },
  savePrefBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  }
});

export default MealPlannerScreen;