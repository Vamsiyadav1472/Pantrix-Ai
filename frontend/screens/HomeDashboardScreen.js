import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme';
import {
  pantryService,
  mealPlanService,
  dashboardService,
  profileService,
} from '../services/api';
import {
  Bell,
  Plus,
  Scan,
  UtensilsCrossed,
  ShoppingBasket,
  Package,
  AlertTriangle,
  Clock,
  Milk,
  Cherry,
  Croissant,
  Calendar,
  Trash2,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ─── Translations (unchanged) ─────────────────────────────────────────────────
const translations = {
  en: {
    hello: 'Hello',
    subtitle: 'Your pantry is looking healthy.',
    totalItems: 'Total Items',
    expiringSoon: 'Expiring Soon',
    expired: 'Expired',
    mealPlanner: 'Meal Planner',
    goToPlanner: 'Go to Planner',
    todaySchedule: "Today's Schedule",
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    noMealPlanned: 'No meal planned',
    quickActions: 'Quick Actions',
    addItem: 'Add Item',
    scanner: 'Scanner',
    recipes: 'Recipes',
    grocery: 'Grocery',
    recentlyAdded: 'Recently Added',
    seeAll: 'See All',
    noItemsRecently: 'No items added recently.',
    foodWasteReport: 'Food Waste Report',
    wastePercentage: 'Waste',
    totalPantryItems: 'Total Items',
    expiredPantryItems: 'Expired',
    expiringSoonPantryItems: 'Expiring',
    wasteReportSubtitle: 'Track and reduce your food waste.',
  },
  te: {
    hello: 'హలో',
    subtitle: 'మీ పాంట్రీ ఆరోగ్యంగా ఉంది.',
    totalItems: 'మొత్తం వస్తువులు',
    expiringSoon: 'త్వరలో గడువు ముగిసేవి',
    expired: 'గడువు ముగిసినవి',
    mealPlanner: 'మీల్ ప్లానర్',
    goToPlanner: 'ప్లానర్‌కు వెళ్ళండి',
    todaySchedule: 'ఈరోజు షెడ్యూల్',
    breakfast: 'ఉదయం అల్పాహారం',
    lunch: 'మధ్యాహ్న భోజనం',
    dinner: 'రాత్రి భోజనం',
    snack: 'స్నాక్',
    noMealPlanned: 'మీల్ ప్లాన్ చేయలేదు',
    quickActions: 'త్వరిత చర్యలు',
    addItem: 'వస్తువు జోడించండి',
    scanner: 'స్కానర్',
    recipes: 'వంటకాలు',
    grocery: 'గ్రోసరీ',
    recentlyAdded: 'ఇటీవల జోడించినవి',
    seeAll: 'అన్నీ చూడండి',
    noItemsRecently: 'ఇటీవల వస్తువులు జోడించలేదు.',
    foodWasteReport: 'ఆహార వృధా నివేదిక',
    wastePercentage: 'వృధా శాతం',
    totalPantryItems: 'మొత్తం పాంట్రీ వస్తువులు',
    expiredPantryItems: 'గడువు ముగిసినవి',
    expiringSoonPantryItems: 'త్వరలో గడువు ముగిసేవి',
    wasteReportSubtitle: 'మీ ఆహార వృధాను పర్యవేక్షించి, తగ్గించండి.',
  },
  hi: {
    hello: 'हेलो',
    subtitle: 'आपकी पैंट्री अच्छी स्थिति में है.',
    totalItems: 'कुल आइटम',
    expiringSoon: 'जल्द समाप्त होने वाले',
    expired: 'समाप्त',
    mealPlanner: 'मील प्लानर',
    goToPlanner: 'प्लानर पर जाएं',
    todaySchedule: 'आज का शेड्यूल',
    breakfast: 'नाश्ता',
    lunch: 'लंच',
    dinner: 'डिनर',
    snack: 'स्नैक',
    noMealPlanned: 'कोई मील प्लान नहीं',
    quickActions: 'त्वरित कार्य',
    addItem: 'आइटम जोड़ें',
    scanner: 'स्कैनर',
    recipes: 'रेसिपी',
    grocery: 'ग्रोसरी',
    recentlyAdded: 'हाल ही में जोड़े गए',
    seeAll: 'सभी देखें',
    noItemsRecently: 'हाल ही में कोई आइटम नहीं जोड़ा गया.',
    foodWasteReport: 'खाद्य अपशिष्ट रिपोर्ट',
    wastePercentage: 'अपशिष्ट प्रतिशत',
    totalPantryItems: 'कुल पैंट्री आइटम',
    expiredPantryItems: 'समाप्त आइटम',
    expiringSoonPantryItems: 'जल्द समाप्त होने वाले',
    wasteReportSubtitle: 'अपने भोजन की बर्बादी को ट्रैक करें और कम करें।',
  },
  ta: {
    hello: 'வணக்கம்',
    subtitle: 'உங்கள் பாண்ட்ரி நன்றாக உள்ளது.',
    totalItems: 'மொத்த பொருட்கள்',
    expiringSoon: 'விரைவில் காலாவதியாகும்',
    expired: 'காலாவதியானவை',
    mealPlanner: 'உணவு திட்டம்',
    goToPlanner: 'திட்டத்திற்கு செல்லவும்',
    todaySchedule: 'இன்றைய அட்டவணை',
    breakfast: 'காலை உணவு',
    lunch: 'மதிய உணவு',
    dinner: 'இரவு உணவு',
    snack: 'சிற்றுண்டி',
    noMealPlanned: 'உணவு திட்டம்மிடப்படவில்லை',
    quickActions: 'விரைவு செயல்கள்',
    addItem: 'பொருள் சேர்க்கவும்',
    scanner: 'ஸ்கேனர்',
    recipes: 'சமையல் குறிப்புகள்',
    grocery: 'மளிகை',
    recentlyAdded: 'சமீபத்தில் சேர்க்கப்பட்டது',
    seeAll: 'அனைத்தையும் காண்க',
    noItemsRecently: 'சமீபத்தில் பொருட்கள் சேர்க்கப்படவில்லை.',
    foodWasteReport: 'உணவு கழிவு அறிக்கை',
    wastePercentage: 'கழிவு சதவீதம்',
    totalPantryItems: 'மொத்த பாண்ட்ரி பொருட்கள்',
    expiredPantryItems: 'காலாவதியான பொருட்கள்',
    expiringSoonPantryItems: 'விரைவில் காலாவதியாகும்',
    wasteReportSubtitle: 'உங்கள் உணவு கழிவுகளை கண்காணித்து குறைக்கவும்.',
  },
};

const getText = (language, key) => {
  return (
    (translations[language] && translations[language][key]) ||
    translations.en[key] ||
    key
  );
};

const getWasteColor = (percentage) => {
  const pct = parseFloat(percentage);
  if (pct === 0) return Theme.colors.primary;
  if (pct < 15) return Theme.colors.primary;
  if (pct < 30) return Theme.colors.warning;
  return Theme.colors.danger;
};

// ─── Expiry Notification Helper ───────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const scheduleExpiryNotifications = async (pantryItems) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted.');
      return;
    }

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content && notif.content.title === 'Pantry Expiry Alert') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    const now = new Date();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

    for (const item of pantryItems) {
      if (!item.expiry_date) continue;
      const expDate = new Date(item.expiry_date);
      const diffMs = expDate - now;
      if (diffMs > 0 && diffMs <= twoDaysMs) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Pantry Expiry Alert',
            body: `${item.name} is expiring soon. Use it before it expires.`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: { seconds: 5, repeats: false },
        });
      }
    }
  } catch (err) {
    console.log('Notification scheduling error:', err);
  }
};
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonBox = ({ width: w, height: h, borderRadius: br = 12, style }) => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: br, backgroundColor: Theme.colors.border },
        animatedStyle,
        style,
      ]}
    />
  );
};

const HomeDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({ total_items: 0, expiring_soon: 0, expired: 0 });
  const [wasteReport, setWasteReport] = useState({
    total_items: 0, expired: 0, expiring_soon: 0, waste_percentage: '0.0',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Pantrix User');
  const [userInitial, setUserInitial] = useState('P');
  const [recentItems, setRecentItems] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [language, setLanguage] = useState('en');

  // Animations using Reanimated
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);

  const runEntrance = () => {
    fadeAnim.value = withTiming(1, { duration: 600 });
    slideAnim.value = withTiming(0, { duration: 500 });
  };

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }]
  }));

  const fetchUserData = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      setLanguage(savedLanguage || 'en');

      const userData = await AsyncStorage.getItem('userData');

      if (userData) {
        const user = JSON.parse(userData);
        const id = user.user_id || user.id || 1;
        setUserId(id);

        const localName =
          user.full_name || user.name || user.username ||
          user.email?.split('@')[0] || 'Pantrix User';

        setUserName(localName);
        setUserInitial(localName.charAt(0).toUpperCase());

        try {
          const profileResponse = await profileService.getProfile(id);
          const profile = profileResponse.data;

          const freshName =
            profile.full_name || profile.name || profile.username ||
            user.full_name || user.name || user.username ||
            user.email?.split('@')[0] || 'Pantrix User';

          setUserName(freshName);
          setUserInitial(freshName.charAt(0).toUpperCase());

          if (freshName !== localName) {
            await AsyncStorage.setItem('userData', JSON.stringify({
              ...user, full_name: freshName, name: freshName, username: freshName,
            }));
          }
        } catch (apiError) {
          console.log('Profile refresh failed, using cached name.');
        }
      }
    } catch (e) {
      console.log('Error fetching user data:', e);
    }
  };

  const fetchStatsAndRecent = async () => {
    if (!userId) return;

    try {
      const statsResponse = await dashboardService.getStats(userId);
      setStats(statsResponse.data);

      const pantryResponse = await pantryService.getAll(userId);
      const allItems = pantryResponse.data || [];

      const now = new Date();
      let expiredCount = 0;
      let expiringSoonCount = 0;

      allItems.forEach((item) => {
        if (item.expiry_date) {
          const exp = new Date(item.expiry_date);
          const diffMs = exp - now;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffMs < 0) expiredCount++;
          else if (diffDays <= 7) expiringSoonCount++;
        }
      });

      const totalItemsCount = allItems.length;
      const wastePct = totalItemsCount > 0
        ? ((expiredCount / totalItemsCount) * 100).toFixed(1) : '0.0';

      setWasteReport({
        total_items: totalItemsCount,
        expired: expiredCount,
        expiring_soon: expiringSoonCount,
        waste_percentage: wastePct,
      });

      scheduleExpiryNotifications(allItems);

      const sorted = [...allItems].sort((a, b) => b.id - a.id);
      const uniqueRecent = [];
      const seenNames = new Set();
      for (const item of sorted) {
        if (!seenNames.has(item.name.toLowerCase())) {
          uniqueRecent.push(item);
          seenNames.add(item.name.toLowerCase());
        }
        if (uniqueRecent.length >= 5) break;
      }
      setRecentItems(uniqueRecent);

      const today = new Date().toISOString().split('T')[0];
      const mealResponse = await mealPlanService.getPlans(userId);
      const mealsForToday = (mealResponse.data || []).filter((m) => {
        const pDate = typeof m.date === 'string'
          ? m.date
          : new Date(m.date).toISOString().split('T')[0];
        return pDate === today;
      });
      
      if (mealsForToday.length > 0) {
        const itemsRes = await mealPlanService.getItems(mealsForToday[0].id);
        setTodayMeals(itemsRes.data || []);
      } else {
        setTodayMeals([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      runEntrance();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      if (userId) {
        setLoading(true);
        fetchStatsAndRecent();
      } else {
        setLoading(false);
        runEntrance();
      }
    }, [userId])
  );

  const getCategoryIcon = (category, name = '') => {
    const cat = category?.toLowerCase() || '';
    const n = name.toLowerCase();
    if (cat === 'vegetables' || n.includes('tomato') || n.includes('onion')) {
      return <Cherry size={28} color={Theme.colors.primary} strokeWidth={1.8} />;
    }
    if (cat === 'dairy' || n.includes('milk') || n.includes('cheese')) {
      return <Milk size={28} color={Theme.colors.info} strokeWidth={1.8} />;
    }
    if (cat === 'fruits' || n.includes('apple') || n.includes('banana')) {
      return <Cherry size={28} color={Theme.colors.accent} strokeWidth={1.8} />;
    }
    if (cat === 'grains' || n.includes('bread') || n.includes('rice')) {
      return <Croissant size={28} color="#D97706" strokeWidth={1.8} />;
    }
    return <Package size={28} color={Theme.colors.textLight} strokeWidth={1.8} />;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
    fetchStatsAndRecent();
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return '☀️ Good Morning';
    if (hr < 17) return '🌤️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const mealTypes = [
    { key: 'breakfast', value: 'Breakfast', emoji: '🌅', color: '#F59E0B', bg: '#FEF3C7' },
    { key: 'lunch', value: 'Lunch', emoji: '☀️', color: '#10B981', bg: '#D1FAE5' },
    { key: 'snack', value: 'Snack', emoji: '🍎', color: '#EF4444', bg: '#FEE2E2' },
    { key: 'dinner', value: 'Dinner', emoji: '🌙', color: '#6366F1', bg: '#E0E7FF' },
  ];

  const statCards = [
    {
      label: getText(language, 'totalItems'),
      value: stats.total_items,
      icon: <Package size={22} color="#3B82F6" strokeWidth={2} />,
      gradient: ['#DBEAFE', '#BFDBFE'],
      iconBg: '#3B82F6',
    },
    {
      label: getText(language, 'expiringSoon'),
      value: stats.expiring_soon,
      icon: <Clock size={22} color="#F59E0B" strokeWidth={2} />,
      gradient: ['#FEF3C7', '#FDE68A'],
      iconBg: '#F59E0B',
    },
    {
      label: getText(language, 'expired'),
      value: stats.expired,
      icon: <AlertTriangle size={22} color="#EF4444" strokeWidth={2} />,
      gradient: ['#FEE2E2', '#FECACA'],
      iconBg: '#EF4444',
    },
  ];

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Theme.colors.background }}>
        <LinearGradient
          colors={Theme.gradients.background}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.skeletonHeader}>
            <View>
              <SkeletonBox width={160} height={22} borderRadius={8} />
              <SkeletonBox width={120} height={14} borderRadius={6} style={{ marginTop: 8 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SkeletonBox width={44} height={44} borderRadius={22} />
              <SkeletonBox width={44} height={44} borderRadius={22} />
            </View>
          </View>
          <View style={{ paddingHorizontal: 24, gap: 16, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <SkeletonBox key={i} width={(width - 64) / 3} height={100} borderRadius={20} />
              ))}
            </View>
            <SkeletonBox width="100%" height={160} borderRadius={20} />
            <SkeletonBox width="100%" height={180} borderRadius={20} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={Theme.gradients.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
        >
          <Animated.View style={entranceStyle}>

            {/* ─── Header ─── */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.subtitle}>{getText(language, 'subtitle')}</Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate('NotificationCenter')}
                >
                  <Bell size={22} color="#000000" strokeWidth={2.5} />
                  {stats.expiring_soon > 0 && <View style={styles.badge} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.avatarButton}
                  onPress={() => navigation.navigate('Profile')}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{userInitial}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>


            {/* ─── Food Waste Report ─── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <TrendingUp size={18} color={Theme.colors.primary} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>{getText(language, 'foodWasteReport')}</Text>
                </View>
              </View>

              <View style={styles.wasteCard}>
                <LinearGradient
                  colors={['rgba(34,197,94,0.08)', 'rgba(16,185,129,0.04)']}
                  style={styles.wasteCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.wasteCardHeader}>
                    <View style={[styles.wasteIconWrap, { backgroundColor: getWasteColor(wasteReport.waste_percentage) + '20' }]}>
                      <Trash2 size={22} color={getWasteColor(wasteReport.waste_percentage)} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.wastePct, { color: getWasteColor(wasteReport.waste_percentage) }]}>
                        {wasteReport.waste_percentage}% {getText(language, 'wastePercentage')}
                      </Text>
                      <Text style={styles.wasteSubtitle}>{getText(language, 'wasteReportSubtitle')}</Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(parseFloat(wasteReport.waste_percentage), 100)}%`,
                          backgroundColor: getWasteColor(wasteReport.waste_percentage),
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.wasteStats}>
                    {[
                      { label: getText(language, 'totalPantryItems'), value: wasteReport.total_items, color: Theme.colors.text },
                      { label: getText(language, 'expiredPantryItems'), value: wasteReport.expired, color: Theme.colors.danger },
                      { label: getText(language, 'expiringSoonPantryItems'), value: wasteReport.expiring_soon, color: Theme.colors.warning },
                    ].map((ws, i) => (
                      <View key={i} style={styles.wasteStat}>
                        <Text style={[styles.wasteStatVal, { color: ws.color }]}>{ws.value}</Text>
                        <Text style={styles.wasteStatLbl}>{ws.label}</Text>
                        {i < 2 && <View style={styles.wasteSep} />}
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* ─── Meal Planner ─── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Calendar size={18} color={Theme.colors.primary} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>{getText(language, 'mealPlanner')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => navigation.navigate('MealPlanner')}
                >
                  <Text style={styles.seeAllText}>{getText(language, 'goToPlanner')}</Text>
                  <ChevronRight size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.mealCard}>
                {mealTypes.map((type) => {
                  const meal = todayMeals.find(
                    (m) => m.meal_type.toLowerCase() === type.value.toLowerCase()
                  );
                  return (
                    <View key={type.value} style={styles.mealRow}>
                      {meal ? (
                        <TouchableOpacity
                          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 }}
                          onPress={() => navigation.navigate('MealPlanner')}
                        >
                          <View style={[styles.mealEmojiBg, { backgroundColor: type.bg }]}>
                            <Text style={styles.mealEmoji}>{type.emoji}</Text>
                          </View>
                          <View style={styles.mealInfo}>
                            <Text style={[styles.mealTypeLabel, { color: type.color }]}>{getText(language, type.key)}</Text>
                            <Text style={styles.mealName} numberOfLines={1}>
                              {meal.meal_name || meal.recipe_name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                          <View style={[styles.mealEmojiBg, { backgroundColor: type.bg }]}>
                            <Text style={styles.mealEmoji}>{type.emoji}</Text>
                          </View>
                          <View style={styles.mealInfo}>
                            <Text style={[styles.mealTypeLabel, { color: type.color }]}>{getText(language, type.key)}</Text>
                            <Text style={styles.mealName} numberOfLines={1}>
                              {getText(language, 'noMealPlanned')}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.addMealBtn}
                            onPress={() =>
                              navigation.navigate('AddMealPlan', {
                                mealType: type.value,
                                date: new Date().toISOString().split('T')[0],
                              })
                            }
                          >
                            <Plus size={14} color={Theme.colors.primary} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ─── Quick Actions ─── */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Sparkles size={18} color={Theme.colors.accent} strokeWidth={2} />
                <Text style={styles.sectionTitle}>{getText(language, 'quickActions')}</Text>
              </View>

              <View style={styles.actionsGrid}>
                {[
                  {
                    label: getText(language, 'addItem'),
                    icon: <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />,
                    gradient: Theme.gradients.primary,
                    screen: 'QuickAddItem',
                  },
                  {
                    label: getText(language, 'scanner'),
                    icon: <Scan size={24} color="#FFFFFF" strokeWidth={2} />,
                    gradient: [Theme.colors.info, '#2563EB'],
                    screen: 'BarcodeScanner',
                  },
                  {
                    label: getText(language, 'recipes'),
                    icon: <UtensilsCrossed size={24} color="#FFFFFF" strokeWidth={2} />,
                    gradient: Theme.gradients.amber,
                    screen: 'Recipes',
                  },
                  {
                    label: getText(language, 'grocery'),
                    icon: <ShoppingBasket size={24} color="#FFFFFF" strokeWidth={2} />,
                    gradient: Theme.gradients.purple,
                    screen: 'Grocery',
                  },
                ].map((action, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.actionItem}
                    onPress={() => navigation.navigate(action.screen)}
                    activeOpacity={0.82}
                  >
                    <LinearGradient
                      colors={action.gradient}
                      style={styles.actionIconBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {action.icon}
                    </LinearGradient>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ─── Recently Added ─── */}
            <View style={[styles.section, { paddingBottom: 100 }]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Package size={18} color={Theme.colors.primary} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>{getText(language, 'recentlyAdded')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => navigation.navigate('Pantry')}
                >
                  <Text style={styles.seeAllText}>{getText(language, 'seeAll')}</Text>
                  <ChevronRight size={14} color={Theme.colors.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 14, paddingRight: 8 }}
              >
                {recentItems.length === 0 ? (
                  <View style={styles.emptyRecent}>
                    <Text style={styles.emptyRecentEmoji}>🧺</Text>
                    <Text style={styles.emptyRecentText}>{getText(language, 'noItemsRecently')}</Text>
                  </View>
                ) : (
                  recentItems.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.recentItem}
                      onPress={() => navigation.navigate('ItemDetail', { item })}
                      activeOpacity={0.85}
                    >
                      <View style={styles.recentIconWrap}>
                        {getCategoryIcon(item.category, item.name)}
                      </View>
                      <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>

          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
  },
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  greeting: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 15,
    color: Theme.colors.textMuted,
  },
  userName: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 28,
    color: Theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  badge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Theme.colors.danger,
    borderWidth: 1.5,
    borderColor: Theme.colors.card,
  },
  avatarButton: {
    ...Theme.shadows.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#000000',
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 18,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 22,
    color: Theme.colors.text,
    lineHeight: 28,
  },
  statLabel: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 10,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  // Section
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: Theme.colors.text,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.pill,
  },
  seeAllText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  // Waste Card
  wasteCard: {
    borderRadius: 22,
    overflow: 'hidden',
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.15)',
  },
  wasteCardGradient: {
    padding: 18,
    backgroundColor: Theme.colors.card,
  },
  wasteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  wasteIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wastePct: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 18,
    lineHeight: 24,
  },
  wasteSubtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  progressTrack: {
    height: 10,
    backgroundColor: Theme.colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  wasteStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    position: 'relative',
  },
  wasteStat: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  wasteStatVal: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 18,
  },
  wasteStatLbl: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 10,
    color: Theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 3,
    textAlign: 'center',
  },
  wasteSep: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 1,
    height: 28,
    backgroundColor: Theme.colors.border,
  },
  // Meal Card
  mealCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 22,
    padding: 16,
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    gap: 12,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  mealEmojiBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealInfo: {
    flex: 1,
  },
  mealTypeLabel: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 11,
    color: Theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  mealName: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: Theme.colors.text,
    marginTop: 2,
  },
  addMealBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconBg: {
    width: 58,
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Theme.shadows.md,
  },
  actionLabel: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: Theme.colors.text,
    textAlign: 'center',
  },
  // Recently Added
  recentItem: {
    alignItems: 'center',
    width: 84,
  },
  recentIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: Theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  recentName: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 13,
    color: Theme.colors.text,
    textAlign: 'center',
  },
  emptyRecent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
    width: width - 48,
  },
  emptyRecentEmoji: {
    fontSize: 32,
  },
  emptyRecentText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textLight,
    textAlign: 'center',
  },
});

export default HomeDashboardScreen;