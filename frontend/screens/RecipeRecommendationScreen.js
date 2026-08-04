import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withDelay } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Theme } from '../theme';
import { recipeService, aiRecipeService, pantryService, favoritesService } from '../services/api';
import { ChefHat, Clock, Flame, ChevronRight, Sparkles, Filter, Mic, MicOff, Heart, Zap } from 'lucide-react-native';
const {
  width
} = Dimensions.get('window');

// Detect Expo Go runtime environment safely
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient || Constants.appOwnership === 'expo';

// Dynamically require expo-speech-recognition only if NOT in Expo Go
let ExpoSpeechRecognitionModule = null;
let useSpeechRecognitionEvent = null;
if (!isExpoGo) {
  try {
    const speechModule = require('expo-speech-recognition');
    ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
    useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
  } catch (e) {
    // Module missing or in unsupported environment
    console.warn('Failed to load expo-speech-recognition:', e);
  }
}
const isVoiceAvailable = !isExpoGo && ExpoSpeechRecognitionModule && typeof ExpoSpeechRecognitionModule.start === 'function';

// Sub-component wrapper to cleanly register speech recognition events without breaking React hook rules
const SpeechListener = ({
  setIsListening,
  setAiPrompt
}) => {
  if (!useSpeechRecognitionEvent) return null;
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });
  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });
  useSpeechRecognitionEvent('result', event => {
    const spokenText = event.results && event.results[0] ? event.results[0].transcript : '';
    if (spokenText) {
      setAiPrompt(spokenText);
    }
    if (event.isFinal) {
      setIsListening(false);
      try {
        if (ExpoSpeechRecognitionModule && typeof ExpoSpeechRecognitionModule.stop === 'function') {
          ExpoSpeechRecognitionModule.stop();
        }
      } catch (e) {}
    }
  });
  useSpeechRecognitionEvent('error', event => {
    console.warn('Speech recognition error:', event.error, event.message);
    setIsListening(false);
    if (event.error !== 'no-match' && event.error !== 'aborted') {
      Alert.alert('Voice Recognition Error', event.message || 'Could not recognize speech. Please try again.');
    }
  });
  return null;
};

// AI thinking animation
const AIThinkingDot = ({
  delay = 0
}) => {
  const {
    t
  } = useTranslation();
  const bounce = useSharedValue(0);
  useEffect(() => {
    bounce.value = withDelay(delay, withRepeat(withSequence(withTiming(-8, {
      duration: 400
    }), withTiming(0, {
      duration: 400
    }), withDelay(600, withTiming(0, {
      duration: 0
    }))), -1, false));
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: bounce.value
    }]
  }));
  return <Animated.View style={[styles.thinkingDot, animatedStyle]} />;
};
const RecipeRecommendationScreen = ({
  navigation, route
}) => {
  const {
    t
  } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState(1);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedRecipe, setAiGeneratedRecipe] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [favorites, setFavorites] = useState({});
  const fadeAnim = useSharedValue(0);
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value
  }));

  // ─── Favorites helpers ────────────────────────────────────────────────────
  const loadFavorites = async () => {
    try {
      const response = await favoritesService.getFavorites(userId);
      const favs = {};
      response.data.forEach(fav => {
        favs[fav.recipe_id] = fav.id;
      });
      setFavorites(favs);
    } catch (e) {
      console.log('Error loading favorites:', e);
    }
  };

  const toggleFavorite = async recipeId => {
    try {
      if (favorites[recipeId]) {
        // Remove favorite
        await favoritesService.removeFavorite(favorites[recipeId]);
        setFavorites(prev => {
          const updated = { ...prev };
          delete updated[recipeId];
          return updated;
        });
      } else {
        // Add favorite
        const response = await favoritesService.addFavorite(userId, { recipe_id: recipeId });
        setFavorites(prev => ({
          ...prev,
          [recipeId]: response.data.id
        }));
      }
    } catch (e) {
      console.log('Error toggling favorite:', e);
      Alert.alert('Error', 'Failed to update favorites.');
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleMicPress = async () => {
    // 1. Detect if running in Expo Go
    if (isExpoGo || !isVoiceAvailable) {
      Alert.alert('Voice Search Not Available', 'Voice search requires a Development Build because speech recognition is not supported in Expo Go. Please use the text input or install the Development Build.', [{
        text: 'OK'
      }]);
      return;
    }

    // 2. Full speech recognition implementation for Development Builds
    try {
      if (isListening) {
        if (typeof ExpoSpeechRecognitionModule.stop === 'function') {
          await ExpoSpeechRecognitionModule.stop();
        }
        setIsListening(false);
        return;
      }

      // Request microphone and speech permissions
      const permResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert('Permission Denied', 'Microphone and speech recognition permissions are required to search recipes by voice.');
        return;
      }
      setIsListening(true);
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false
      });
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
      Alert.alert('Voice Search Error', 'Failed to start voice search. Please try again or type your recipe query.');
    }
  };
  useEffect(() => {
    const init = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.user_id || user.id || 1);
        }
      } catch (e) {}
    };
    init();
    loadFavorites();
  }, []);
  const fetchRecipes = async () => {
    try {
      const response = await recipeService.getAll(userId);
      setRecipes(response.data || []);
      fadeAnim.value = withTiming(1, {
        duration: 500
      });
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchRecipes();
  }, [userId]);
  const onRefresh = () => {
    setRefreshing(true);
    fetchRecipes();
  };
  const handleGenerateRecipe = async () => {
    if (!aiPrompt.trim()) {
      Alert.alert('Enter Recipe Name', 'Please type or speak a recipe name like "how to make biriyani".');
      return;
    }
    setGenerating(true);
    let finalPrompt = aiPrompt.trim();
    const filters = route?.params?.filters || {};

    if (filters.excludeMissing || filters.prioritizeExpiry) {
      try {
        const pantryResponse = await pantryService.getAll(userId);
        const allItems = pantryResponse.data || [];
        
        if (filters.excludeMissing && allItems.length > 0) {
          const itemNames = allItems.map(i => i.name).join(', ');
          finalPrompt += `. I only have these ingredients available: ${itemNames}. Please do not require any other main ingredients.`;
        }
        
        if (filters.prioritizeExpiry && allItems.length > 0) {
          const now = new Date();
          const expiring = allItems.filter(i => i.expiry_date && (new Date(i.expiry_date) - now) / (1000*60*60*24) <= 7);
          if (expiring.length > 0) {
            const expNames = expiring.map(i => i.name).join(', ');
            finalPrompt += `. Please prioritize using these expiring ingredients: ${expNames}.`;
          }
        }
      } catch (err) {
        console.log("Failed to fetch pantry for filters", err);
      }
    }
    
    if (filters.selectedDiets && filters.selectedDiets.length > 0) {
      finalPrompt += `. Dietary requirements: ${filters.selectedDiets.join(', ')}.`;
    }
    
    if (filters.selectedTime) {
      finalPrompt += `. The recipe cooking time should be ${filters.selectedTime}.`;
    }

    try {
      const response = await aiRecipeService.generate(userId, finalPrompt);
      const data = response.data;
      let recipeData = {};
      try {
        recipeData = typeof data.recipe === 'string' ? JSON.parse(data.recipe) : data.recipe || {};
      } catch (e) {
        recipeData = {
          description: data.recipe
        };
      }
      const generatedText = recipeData.description || (typeof data.recipe === 'string' ? data.recipe : 'AI generated recipe.');
      setAiGeneratedRecipe(generatedText);
      const newRecipe = {
        id: data.saved_recipe_id || Date.now(),
        name: recipeData.name || aiPrompt.trim(),
        description: recipeData.description || generatedText,
        ai_generated: 1,
        prep_time: 0,
        cook_time: parseInt(recipeData.cooking_time) || 30,
        calories: recipeData.nutrition?.calories || 'AI',
        tags: 'AI Generated,Custom Recipe',
        ...recipeData
      };
      setRecipes(prev => [newRecipe, ...prev]);
      Alert.alert('Success', 'AI recipe generated and saved successfully.');
    } catch (error) {
      console.error('AI recipe generation error:', error?.response?.data || error);
      const msg = error?.response?.data?.detail || 'Failed to generate AI recipe. Check backend and Gemini API key.';
      Alert.alert('Generation Failed', msg, [{
        text: 'Cancel',
        style: 'cancel'
      }, {
        text: 'Retry',
        onPress: handleGenerateRecipe
      }]);
    } finally {
      setGenerating(false);
    }
  };
  if (loading && !refreshing) {
    return <SafeAreaView style={styles.container}>
        <LinearGradient colors={Theme.gradients.background} style={{
        flex: 1
      }}>
          <View style={styles.loadingContainer}>
            <View style={styles.aiLoadingCard}>
              <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.aiLoadingIcon} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }}>
                <Sparkles size={28} color="#D97706" />
              </LinearGradient>
              <Text style={styles.aiLoadingText}>{t("RecipeRecommendationScreen.Loading_Recipes")}</Text>
              <View style={styles.thinkingDots}>
                <AIThinkingDot delay={0} />
                <AIThinkingDot delay={150} />
                <AIThinkingDot delay={300} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>;
  }
  return <SafeAreaView style={styles.container}>
      {/* Speech event listener active when voice capability is available */}
      {isVoiceAvailable && <SpeechListener setIsListening={setIsListening} setAiPrompt={setAiPrompt} />}

      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t("RecipeRecommendationScreen.AI_Recipes")}</Text>
            <Text style={styles.subtitle}>{t("RecipeRecommendationScreen.Ask_AI_to_generate_any_recipe")}</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('RecipeFilter')}>
            <Filter size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />} showsVerticalScrollIndicator={false}>
          {/* AI Generator Card */}
          <View style={styles.aiCard}>
            <LinearGradient colors={['#FFF8E7', '#FEF3C7']} style={styles.aiCardGrad} start={{
            x: 0,
            y: 0
          }} end={{
            x: 1,
            y: 1
          }}>
              <View style={styles.aiCardHeader}>
                <LinearGradient colors={Theme.gradients.amber} style={styles.aiIconBg} start={{
                x: 0,
                y: 0
              }} end={{
                x: 1,
                y: 1
              }}>
                  <Sparkles size={22} color="#FFFFFF" />
                </LinearGradient>
                <View style={{
                flex: 1
              }}>
                  <Text style={styles.aiCardTitle}>{t("RecipeRecommendationScreen.Generate_Custom_Recipe")}</Text>
                  <Text style={styles.aiCardDesc}>{t("RecipeRecommendationScreen.Ask_AI_or_tap_microphone_biri")}</Text>
                </View>
              </View>

              <View style={styles.aiInputRow}>
                <TextInput value={aiPrompt} onChangeText={setAiPrompt} placeholder={t("RecipeRecommendationScreen.placeholder_Example_how_to_make")} placeholderTextColor={Theme.colors.textPlaceholder} style={styles.aiInput} multiline />
                <TouchableOpacity style={[styles.micBtn, isListening && styles.micBtnActive]} onPress={handleMicPress} activeOpacity={0.8}>
                  <LinearGradient colors={isListening ? [Theme.colors.danger, Theme.colors.dangerDark] : Theme.gradients.primary} style={styles.micGrad} start={{
                  x: 0,
                  y: 0
                }} end={{
                  x: 1,
                  y: 1
                }}>
                    {isListening ? <MicOff size={20} color="#FFFFFF" /> : <Mic size={20} color="#FFFFFF" />}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {isListening && <View style={styles.listeningRow}>
                  <View style={styles.listeningDot} />
                  <Text style={styles.listeningText}>{t("RecipeRecommendationScreen.Listening_Speak_your_recipe")}</Text>
                </View>}

              <TouchableOpacity style={[styles.generateBtn, generating && {
              opacity: 0.75
            }]} onPress={handleGenerateRecipe} disabled={generating} activeOpacity={0.85}>
                <LinearGradient colors={Theme.gradients.amber} style={styles.generateGrad} start={{
                x: 0,
                y: 0
              }} end={{
                x: 1,
                y: 0
              }}>
                  {generating ? <View style={styles.generatingRow}>
                      <View style={styles.thinkingDots}>
                        <AIThinkingDot delay={0} />
                        <AIThinkingDot delay={150} />
                        <AIThinkingDot delay={300} />
                      </View>
                      <Text style={styles.generateBtnText}>{t("RecipeRecommendationScreen.Generating")}</Text>
                    </View> : <>
                      <Zap size={18} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.generateBtnText}>{t("RecipeRecommendationScreen.Generate_Recipe")}</Text>
                    </>}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* AI generated result */}
          {aiGeneratedRecipe ? <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <LinearGradient colors={Theme.gradients.primary} style={styles.resultIconBg}>
                  <ChefHat size={18} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.resultTitle}>{t("RecipeRecommendationScreen.AI_Generated_Recipe")}</Text>
              </View>
              <Text style={styles.resultText}>{aiGeneratedRecipe}</Text>
            </View> : null}

          {/* Recipe list */}
          {recipes.length === 0 ? <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍳</Text>
              <Text style={styles.emptyTitle}>{t("RecipeRecommendationScreen.No_recipes_yet")}</Text>
              <Text style={styles.emptySubtitle}>{t("RecipeRecommendationScreen.Ask_AI_to_generate_your_first")}</Text>
            </View> : <View style={styles.recipesList}>
              <Text style={styles.recipesCount}>{recipes.length}{t("RecipeRecommendationScreen.Saved_Recipes")}</Text>
              {[...recipes].sort((a, b) => {
            const aFav = favorites[a.id] ? 1 : 0;
            const bFav = favorites[b.id] ? 1 : 0;
            return bFav - aFav;
          }).map((recipe, index) => <TouchableOpacity key={recipe.id || index} style={styles.recipeCard} onPress={() => navigation.navigate('RecipeDetail', {
            recipe
          })} activeOpacity={0.88}>
                    {/* Left accent */}
                    <LinearGradient colors={recipe.ai_generated === 1 ? Theme.gradients.amber : Theme.gradients.primary} style={styles.recipeAccent} start={{
              x: 0,
              y: 0
            }} end={{
              x: 0,
              y: 1
            }} />

                    <View style={styles.recipeImageArea}>
                      <Text style={styles.recipeEmoji}>🍲</Text>
                      {recipe.ai_generated === 1 && <View style={styles.aiBadge}>
                          <Sparkles size={9} color="#D97706" />
                          <Text style={styles.aiBadgeText}>{t("RecipeRecommendationScreen.AI")}</Text>
                        </View>}
                    </View>

                    <View style={styles.recipeInfo}>
                      <Text style={styles.recipeName}>
                        {recipe.name || recipe.title || 'AI Recipe'}
                      </Text>

                      <View style={styles.recipeMeta}>
                        <View style={styles.metaChip}>
                          <Clock size={12} color={Theme.colors.textMuted} />
                          <Text style={styles.metaText}>
                            {(Number(recipe.prep_time) || 0) + (Number(recipe.cook_time) || 0)}{t("RecipeRecommendationScreen.m")}</Text>
                        </View>
                        <View style={styles.metaChip}>
                          <Flame size={12} color={Theme.colors.danger} />
                          <Text style={styles.metaText}>{recipe.calories || 'N/A'}{t("RecipeRecommendationScreen.kcal")}</Text>
                        </View>
                      </View>

                      <View style={styles.tagsRow}>
                        {recipe.tags?.split(',').slice(0, 2).map((tag, i) => <View key={i} style={styles.tag}>
                            <Text style={styles.tagText}>{tag.trim()}</Text>
                          </View>)}
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.recipeActions}>
                      <TouchableOpacity style={styles.heartBtn} onPress={() => toggleFavorite(recipe.id)} hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
              }}>
                        <Heart size={20} color={favorites[recipe.id] ? '#EF4444' : Theme.colors.border} fill={favorites[recipe.id] ? '#EF4444' : 'none'} />
                      </TouchableOpacity>
                      <ChevronRight size={16} color={Theme.colors.textLight} />
                    </View>
                  </TouchableOpacity>)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiLoadingCard: {
    alignItems: 'center',
    gap: 16,
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    padding: 32,
    ...Theme.shadows.md,
    width: width * 0.7
  },
  aiLoadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiLoadingText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: Theme.colors.primary
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 30,
    color: Theme.colors.primary,
    letterSpacing: -0.5
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.primary,
    marginTop: 2
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 110
  },
  // AI Card
  aiCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
    ...Theme.shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)'
  },
  aiCardGrad: {
    padding: 18
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16
  },
  aiIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiCardTitle: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: Theme.colors.primary
  },
  aiCardDesc: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: Theme.colors.primary,
    marginTop: 2
  },
  aiInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    alignItems: 'flex-end'
  },
  aiInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: Theme.colors.text,
    minHeight: 50,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)'
  },
  micBtn: {
    borderRadius: 25,
    overflow: 'hidden'
  },
  micBtnActive: {},
  micGrad: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.danger
  },
  listeningText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 13,
    color: Theme.colors.danger
  },
  generateBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Theme.shadows.sm
  },
  generateGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  generateBtnText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: Theme.colors.card
  },
  thinkingDots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  thinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Theme.colors.card
  },
  // Result Card
  resultCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  resultIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 18,
    color: Theme.colors.text
  },
  resultText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 22
  },
  // Recipes list
  recipesList: {
    gap: 12
  },
  recipesCount: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 4
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  recipeAccent: {
    width: 4,
    alignSelf: 'stretch'
  },
  recipeImageArea: {
    width: 80,
    height: 80,
    margin: 12,
    borderRadius: 18,
    backgroundColor: Theme.colors.backgroundMid,
    justifyContent: 'center',
    alignItems: 'center'
  },
  recipeEmoji: {
    fontSize: 36
  },
  aiBadge: {
    position: 'absolute',
    bottom: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  aiBadgeText: {
    fontSize: 9,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#D97706'
  },
  recipeInfo: {
    flex: 1,
    paddingVertical: 14,
    gap: 6
  },
  recipeName: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: Theme.colors.text
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 8
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.backgroundMid,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  metaText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  tagText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 10,
    color: Theme.colors.primaryDark
  },
  recipeActions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  heartBtn: {
    padding: 4
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 12
  },
  emptyEmoji: {
    fontSize: 56
  },
  emptyTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: Theme.colors.text
  },
  emptySubtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center'
  }
});
export default RecipeRecommendationScreen;