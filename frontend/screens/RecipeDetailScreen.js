import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { UtensilsCrossed, Clock, Flame, Star, Check, ChevronLeft, ChefHat, Sparkles, Lightbulb } from 'lucide-react-native';
import Button from '../components/Button';
const {
  width
} = Dimensions.get('window');
const RecipeDetailScreen = ({
  route,
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const {
    recipe
  } = route.params || {};

  let parsedRecipe = { ...recipe };
  
  // Clean up if the whole recipe JSON was saved into one field by mistake
  const fieldsToCheck = [parsedRecipe.description, parsedRecipe.making_process, parsedRecipe.steps, parsedRecipe.instructions, parsedRecipe.ingredients];
  for (const field of fieldsToCheck) {
    if (typeof field === 'string' && field.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(field);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          parsedRecipe = { ...parsedRecipe, ...parsed };
          // Don't render the raw JSON as description if we found the payload here
          if (parsedRecipe.description === field) {
            parsedRecipe.description = parsed.description || '';
          }
          break;
        }
      } catch (e) {}
    }
  }

  // Extract values dynamically with fallbacks
  const title = parsedRecipe.name || parsedRecipe.recipe_name || parsedRecipe.title || 'Delicious Recipe';
  const description = parsedRecipe.description || '';
  
  let totalTime = 0;
  const p = String(parsedRecipe.prep_time || '0');
  const c = String(parsedRecipe.cook_time || '0');
  if (/^\d+$/.test(p) && /^\d+$/.test(c)) {
    totalTime = parseInt(p) + parseInt(c);
  }

  const rawTime = parsedRecipe.cooking_time || parsedRecipe.cook_time || parsedRecipe.prep_time;
  let cookingTime = '30 min';
  if (totalTime > 0 && !parsedRecipe.cooking_time) {
    // Format total minutes to hours and minutes if needed, or just show mins
    if (totalTime >= 60) {
      const h = Math.floor(totalTime / 60);
      const m = totalTime % 60;
      cookingTime = m > 0 ? `${h}h ${m}m` : `${h}h`;
    } else {
      cookingTime = `${totalTime} min`;
    }
  } else if (rawTime) {
    if (typeof rawTime === 'number') {
      cookingTime = `${rawTime} min`;
    } else {
      const strRaw = String(rawTime).toLowerCase();
      cookingTime = (strRaw.includes('min') || strRaw.includes('h')) ? rawTime : `${rawTime} min`;
    }
  }
  
  const rawCalories = parsedRecipe.nutrition?.calories || parsedRecipe.calories;
  const calories = rawCalories ? (typeof rawCalories === 'number' ? `${Math.round(rawCalories)} kcal` : rawCalories) : 'N/A';
  
  const difficulty = parsedRecipe.difficulty || 'Medium';

  let rawIngredients = parsedRecipe.ingredients || [];
  if (typeof rawIngredients === 'string') {
    try {
      const parsed = JSON.parse(rawIngredients);
      rawIngredients = parsed;
    } catch (e) {
      rawIngredients = rawIngredients.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (typeof rawIngredients === 'object' && rawIngredients !== null && !Array.isArray(rawIngredients)) {
    rawIngredients = rawIngredients.ingredients || rawIngredients.items || Object.values(rawIngredients);
  }
  if (!Array.isArray(rawIngredients)) {
    rawIngredients = typeof rawIngredients === 'string' ? [rawIngredients] : [];
  }

  const ingredients = rawIngredients.map(item => {
    if (typeof item === 'object' && item !== null) {
      return `${item.amount || ''} ${item.name || ''}`.trim();
    }
    return String(item);
  });

  // Instructions
  let rawInstructions = parsedRecipe.instructions || parsedRecipe.making_process || parsedRecipe.steps || [];
  if (typeof rawInstructions === 'string') {
    try {
      const parsed = JSON.parse(rawInstructions);
      rawInstructions = parsed;
    } catch (e) {
      // Split by newlines or numbers like "1. "
      rawInstructions = rawInstructions.split(/(?:\r?\n|(?=\d+\.\s))/).map(s => s.trim()).filter(Boolean);
    }
  }
  
  // If the parsed JSON is actually an object (like the full recipe payload), extract the steps
  if (typeof rawInstructions === 'object' && rawInstructions !== null && !Array.isArray(rawInstructions)) {
    rawInstructions = rawInstructions.making_process || rawInstructions.steps || rawInstructions.instructions || Object.values(rawInstructions);
  }
  
  if (!Array.isArray(rawInstructions)) {
    rawInstructions = typeof rawInstructions === 'string' ? [rawInstructions] : [];
  }
  
  const instructions = rawInstructions.map(step => {
    if (typeof step === 'object' && step !== null) {
      return step.step || step.instruction || step.description || JSON.stringify(step);
    }
    return String(step);
  }).filter(Boolean);

  // Tips
  let tips = parsedRecipe.tips || [];
  if (typeof tips === 'string') {
    try { tips = JSON.parse(tips); } catch (e) { tips = []; }
  }
  if (!Array.isArray(tips)) tips = [];
  return <SafeAreaView style={styles.container}>
    <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <LinearGradient colors={['#064E3B', '#059669', '#22C55E']} style={styles.imageHeader} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#000000" />
          </TouchableOpacity>

          <View style={styles.heroCenter}>
            <View style={styles.heroEmojiBg}>
              <Text style={styles.heroEmoji}>🍲</Text>
            </View>
            {parsedRecipe.ai_generated === 1 && <View style={styles.aiTag}>
              <Sparkles size={11} color="#D97706" />
              <Text style={styles.aiTagText}>{t("RecipeDetailScreen.AI_GENERATED_RECIPE")}</Text>
            </View>}
          </View>
        </LinearGradient>

        {/* Card Content */}
        <View style={styles.content}>
          <Text style={[styles.title, recipe?.ai_generated === 1 && { color: '#000000' }]}>{title}</Text>
          {description ? <Text style={[styles.description, recipe?.ai_generated === 1 && { color: '#000000' }]}>{description}</Text> : null}

          {/* Meta Row */}
          <View style={styles.metaRow}>
            <View style={[styles.metaChip, recipe?.ai_generated === 1 && { backgroundColor: '#10B981' }]}>
              <Clock size={14} color={recipe?.ai_generated === 1 ? '#000000' : Theme.colors.primary} strokeWidth={2} />
              <Text style={[styles.meta, recipe?.ai_generated === 1 && { color: '#FFFFFF' }]}>{cookingTime}</Text>
            </View>
            <View style={[styles.metaChip, recipe?.ai_generated === 1 && { backgroundColor: '#10B981' }]}>
              <Flame size={14} color={recipe?.ai_generated === 1 ? '#000000' : Theme.colors.danger} strokeWidth={2} />
              <Text style={[styles.meta, recipe?.ai_generated === 1 && { color: '#FFFFFF' }]}>{calories}{t("RecipeDetailScreen.kcal")}</Text>
            </View>
            {recipe?.servings && <View style={[styles.metaChip, recipe?.ai_generated === 1 && { backgroundColor: '#10B981' }]}>
              <UtensilsCrossed size={14} color={recipe?.ai_generated === 1 ? '#000000' : Theme.colors.accent} strokeWidth={2} />
              <Text style={[styles.meta, recipe?.ai_generated === 1 && { color: '#FFFFFF' }]}>{recipe.servings}{t("RecipeDetailScreen.Servings")}</Text>
            </View>}
            <View style={[styles.metaChip, recipe?.ai_generated === 1 && { backgroundColor: '#10B981' }]}>
              <Star size={14} color={recipe?.ai_generated === 1 ? '#000000' : Theme.colors.warning} fill={recipe?.ai_generated === 1 ? '#000000' : Theme.colors.warning} strokeWidth={0} />
              <Text style={[styles.meta, recipe?.ai_generated === 1 && { color: '#FFFFFF' }]}>{difficulty}</Text>
            </View>
          </View>

          {/* Nutrition Information */}
          {recipe?.nutrition && <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("RecipeDetailScreen.Nutrition_Information")}</Text>
            <View style={styles.nutritionGrid}>
              {[{
                label: 'Protein',
                val: `${recipe.nutrition.protein || 0}g`,
                color: '#3B82F6'
              }, {
                label: 'Carbs',
                val: `${recipe.nutrition.carbs || 0}g`,
                color: '#F59E0B'
              }, {
                label: 'Fat',
                val: `${recipe.nutrition.fats || recipe.nutrition.fat || 0}g`,
                color: '#EF4444'
              }, {
                label: 'Fiber',
                val: `${recipe.nutrition.fiber || 0}g`,
                color: '#10B981'
              }, {
                label: 'Sugar',
                val: `${recipe.nutrition.sugar || 0}g`,
                color: '#EC4899'
              }, {
                label: 'Sodium',
                val: `${recipe.nutrition.sodium || 0}mg`,
                color: '#8B5CF6'
              }].map((n, i) => <View key={i} style={styles.nutriBox}>
                <Text style={[styles.nutriValue, {
                  color: n.color
                }]}>{n.val}</Text>
                <Text style={styles.nutriLabel}>{n.label}</Text>
              </View>)}
            </View>
          </View>}

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("RecipeDetailScreen.Ingredients_You_Need")}</Text>
            <View style={[styles.ingredientsCard, recipe?.ai_generated === 1 && { backgroundColor: '#10B981' }]}>
              {ingredients.length > 0 ? ingredients.map((item, i) => <View key={i} style={styles.ingredientRow}>
                <View style={[styles.checkIcon, recipe?.ai_generated === 1 && { backgroundColor: '#000000' }]}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={[styles.ingredientText, recipe?.ai_generated === 1 && { color: '#FFFFFF' }]}>{item}</Text>
              </View>) : <Text style={styles.instructionText}>{t("RecipeDetailScreen.No_ingredients_listed")}</Text>}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("RecipeDetailScreen.Step_by_Step_Instructions")}</Text>
            {instructions.length > 0 ? instructions.map((stepItem, i) => <View key={i} style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{i + 1}</Text>
              </View>
              <Text style={[styles.instructionText, recipe?.ai_generated === 1 && { color: '#000000' }]}>
                {stepItem.replace(/^(?:Step \d+:?)\s*/i, '')}
              </Text>
            </View>) : <Text style={styles.instructionText}>{t("RecipeDetailScreen.No_instructions_provided")}</Text>}
          </View>

          {/* Tips */}
          {tips.length > 0 && <View style={styles.section}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12
            }}>
              <Lightbulb size={18} color={Theme.colors.accent} />
              <Text style={styles.sectionTitle}>{t("RecipeDetailScreen.Chef_s_Tips")}</Text>
            </View>
            {tips.map((tip, i) => <View key={i} style={styles.tipCard}>
              <Text style={styles.tipText}>💡 {tip}</Text>
            </View>)}
          </View>}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startCookingBtn} onPress={() => navigation.navigate('CookingMode')} activeOpacity={0.88}>
          <LinearGradient colors={Theme.gradients.primary} style={styles.startCookingGrad} start={{
            x: 0,
            y: 0
          }} end={{
            x: 1,
            y: 0
          }}>
            <ChefHat size={22} color="#FFFFFF" />
            <Text style={styles.startCookingText}>{t("RecipeDetailScreen.Start_Cooking_Mode")}</Text>
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
  scrollContent: {
    paddingBottom: 110
  },
  imageHeader: {
    height: 200,
    paddingTop: 16,
    paddingHorizontal: 20,
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981', // Solid vibrant green
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
    zIndex: 10
  },
  heroCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  heroEmojiBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md
  },
  heroEmoji: {
    fontSize: 42
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10
  },
  aiTagText: {
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#D97706',
    letterSpacing: 0.8
  },
  content: {
    padding: 24,
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 26,
    color: Theme.colors.text,
    textAlign: 'center'
  },
  description: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 8,
    lineHeight: 22,
    textAlign: 'center'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 24,
    gap: 8
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...Theme.shadows.xs,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  meta: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: Theme.colors.text
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: 12
  },
  ingredientsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 22,
    padding: 16,
    ...Theme.shadows.xs,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  ingredientText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 15,
    color: '#000000',
    flex: 1
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    ...Theme.shadows.xs,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepBadgeText: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 13,
    color: Theme.colors.primaryDark
  },
  instructionText: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 15,
    color: '#000000',
    lineHeight: 22
  },
  tipCard: {
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)'
  },
  tipText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: '#D97706',
    lineHeight: 20
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 22,
    padding: 16,
    justifyContent: 'space-between',
    ...Theme.shadows.xs,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  nutriBox: {
    alignItems: 'center',
    width: (width - 116) / 3,
    backgroundColor: Theme.colors.backgroundMid,
    paddingVertical: 10,
    borderRadius: 14
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight
  },
  startCookingBtn: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    ...Theme.shadows.md
  },
  startCookingGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.xl
  },
  startCookingText: {
    color: Theme.colors.card,
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  }
});
export default RecipeDetailScreen;