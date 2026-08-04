import React, { useCallback, useRef } from 'react';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  Package,
  UtensilsCrossed,
  ShoppingBasket,
  CircleUserRound,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Theme } from './theme';

import { useFonts, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreenLib from 'expo-splash-screen';
import './i18n';
import { useTranslation } from 'react-i18next';

SplashScreenLib.preventAutoHideAsync();

// AUTHENTICATION
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen1 from './screens/OnboardingScreen1';
import OnboardingScreen2 from './screens/OnboardingScreen2';
import OnboardingScreen3 from './screens/OnboardingScreen3';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// HOME
import HomeDashboardScreen from './screens/HomeDashboardScreen';
import SmartInsightsScreen from './screens/SmartInsightsScreen';
import DailyRecommendationsScreen from './screens/DailyRecommendationsScreen';
import SearchScreen from './screens/SearchScreen';

// PANTRY
import PantryListScreen from './screens/PantryListScreen';
import AddItemScreen from './screens/AddItemScreen';
import QuickAddItemScreen from './screens/QuickAddItemScreen';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import EditItemScreen from './screens/EditItemScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import FoodDetailsScreen from './screens/FoodDetailsScreen';
import CategoryViewScreen from './screens/CategoryViewScreen';
import EmptyPantryScreen from './screens/EmptyPantryScreen';

// EXPIRY
import ExpiryAlertsScreen from './screens/ExpiryAlertsScreen';
import UrgentExpiryScreen from './screens/UrgentExpiryScreen';
import NotificationCenterScreen from './screens/NotificationCenterScreen';

// RECIPES
import RecipeRecommendationScreen from './screens/RecipeRecommendationScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import CookingModeScreen from './screens/CookingModeScreen';
import FavoriteRecipesScreen from './screens/FavoriteRecipesScreen';
import RecipeFilterScreen from './screens/RecipeFilterScreen';
import MissingIngredientsScreen from './screens/MissingIngredientsScreen';

// MEAL PLANNING
import MealPlannerScreen from './screens/MealPlannerScreen';
import AddMealPlanScreen from './screens/AddMealPlanScreen';
import CalendarViewScreen from './screens/CalendarViewScreen';

// GROCERY
import GroceryListScreen from './screens/GroceryListScreen';
import AddGroceryItemScreen from './screens/AddGroceryItemScreen';
import SmartSuggestionsScreen from './screens/SmartSuggestionsScreen';
import ShoppingHistoryScreen from './screens/ShoppingHistoryScreen';

// AI FEATURES
import ChatAssistantScreen from './screens/ChatAssistantScreen';
import VoiceInputScreen from './screens/VoiceInputScreen';
import ImageRecognitionScreen from './screens/ImageRecognitionScreen';

// ANALYTICS
import UsageAnalyticsScreen from './screens/UsageAnalyticsScreen';
import WasteTrackingScreen from './screens/WasteTrackingScreen';
import SavingsDashboardScreen from './screens/SavingsDashboardScreen';

// PROFILE
import ProfileScreen from './screens/ProfileScreen';
import DietPreferencesScreen from './screens/DietPreferencesScreen';
import AllergySettingsScreen from './screens/AllergySettingsScreen';
import FamilyMembersScreen from './screens/FamilyMembersScreen';
import MyKitchenScreen from './screens/MyKitchenScreen';

// SETTINGS
import AppSettingsScreen from './screens/AppSettingsScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import PrivacySettingsScreen from './screens/PrivacySettingsScreen';

// EXTRA
import InventoryPredictionScreen from './screens/InventoryPredictionScreen';
import CommunityRecipesScreen from './screens/CommunityRecipesScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Premium Tab Bar Background (Dark Glass)
const TabBarBackground = () => (
  <LinearGradient
    colors={['rgba(15, 23, 42, 0.95)', 'rgba(2, 44, 34, 0.98)']}
    style={StyleSheet.absoluteFill}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  />
);

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          position: 'absolute',
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: Theme.typography.fontFamily.bodySemiBold,
          marginTop: 2,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
        tabBarIcon: ({ color, focused }) => {
          const iconSize = focused ? 26 : 22;
          const strokeW = focused ? 2.5 : 1.8;

          if (route.name === 'Dashboard') {
            return <Home color={color} size={iconSize} strokeWidth={strokeW} />;
          }
          if (route.name === 'Pantry') {
            return <Package color={color} size={iconSize} strokeWidth={strokeW} />;
          }
          if (route.name === 'Recipes') {
            return <UtensilsCrossed color={color} size={iconSize} strokeWidth={strokeW} />;
          }
          if (route.name === 'Grocery') {
            return <ShoppingBasket color={color} size={iconSize} strokeWidth={strokeW} />;
          }
          if (route.name === 'Profile') {
            return <CircleUserRound color={color} size={iconSize} strokeWidth={strokeW} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeDashboardScreen} options={{ tabBarLabel: t('BottomNav.Home', 'Home') }} />
      <Tab.Screen name="Pantry" component={PantryListScreen} options={{ tabBarLabel: t('BottomNav.Pantry', 'Pantry') }} />
      <Tab.Screen name="Recipes" component={RecipeRecommendationScreen} options={{ tabBarLabel: t('BottomNav.Recipes', 'Recipes') }} />
      <Tab.Screen name="Grocery" component={GroceryListScreen} options={{ tabBarLabel: t('BottomNav.Grocery', 'Grocery') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('BottomNav.Profile', 'Profile') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreenLib.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          {/* Auth Flow */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
          <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
          <Stack.Screen name="Onboarding3" component={OnboardingScreen3} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

          {/* Main App */}
          <Stack.Screen name="Main" component={MainTabs} />

          {/* Home Screens */}
          <Stack.Screen name="SmartInsights" component={SmartInsightsScreen} />
          <Stack.Screen name="DailyRecommendations" component={DailyRecommendationsScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />

          {/* Pantry Screens */}
          <Stack.Screen name="AddItem" component={AddItemScreen} />
          <Stack.Screen name="QuickAddItem" component={QuickAddItemScreen} />
          <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
          <Stack.Screen name="EditItem" component={EditItemScreen} />
          <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
          <Stack.Screen name="FoodDetails" component={FoodDetailsScreen} />
          <Stack.Screen name="CategoryView" component={CategoryViewScreen} />
          <Stack.Screen name="EmptyPantry" component={EmptyPantryScreen} />

          {/* Expiry Screens */}
          <Stack.Screen name="ExpiryAlerts" component={ExpiryAlertsScreen} />
          <Stack.Screen name="UrgentExpiry" component={UrgentExpiryScreen} />
          <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />

          {/* Recipe Screens */}
          <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
          <Stack.Screen name="CookingMode" component={CookingModeScreen} />
          <Stack.Screen name="FavoriteRecipes" component={FavoriteRecipesScreen} />
          <Stack.Screen name="RecipeFilter" component={RecipeFilterScreen} />
          <Stack.Screen name="MissingIngredients" component={MissingIngredientsScreen} />

          {/* Meal Planning Screens */}
          <Stack.Screen name="MealPlanner" component={MealPlannerScreen} />
          <Stack.Screen name="AddMealPlan" component={AddMealPlanScreen} />
          <Stack.Screen name="CalendarView" component={CalendarViewScreen} />

          {/* Grocery Screens */}
          <Stack.Screen name="AddGroceryItem" component={AddGroceryItemScreen} />
          <Stack.Screen name="SmartSuggestions" component={SmartSuggestionsScreen} />
          <Stack.Screen name="ShoppingHistory" component={ShoppingHistoryScreen} />

          {/* AI Screens */}
          <Stack.Screen name="ChatAssistant" component={ChatAssistantScreen} />
          <Stack.Screen name="VoiceInput" component={VoiceInputScreen} />
          <Stack.Screen name="ImageRecognition" component={ImageRecognitionScreen} />

          {/* Analytics Screens */}
          <Stack.Screen name="UsageAnalytics" component={UsageAnalyticsScreen} />
          <Stack.Screen name="WasteTracking" component={WasteTrackingScreen} />
          <Stack.Screen name="SavingsDashboard" component={SavingsDashboardScreen} />

          {/* Profile Screens */}
          <Stack.Screen name="MyKitchen" component={MyKitchenScreen} />
          <Stack.Screen name="DietPreferences" component={DietPreferencesScreen} />
          <Stack.Screen name="AllergySettings" component={AllergySettingsScreen} />
          <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} />

          {/* Settings Screens */}
          <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />

          {/* Extra Screens */}
          <Stack.Screen name="InventoryPrediction" component={InventoryPredictionScreen} />
          <Stack.Screen name="CommunityRecipes" component={CommunityRecipesScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}