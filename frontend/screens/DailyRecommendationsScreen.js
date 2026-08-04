import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Clock, Flame, ChevronLeft, ChevronRight, Lightbulb, Soup, Salad, Fish, IceCreamCone, Play } from 'lucide-react-native';
const {
  width
} = Dimensions.get('window');
const DailyRecommendationsScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const recommendations = [{
    title: 'Oatmeal with Berries',
    type: 'Breakfast',
    time: '10m',
    calories: '320',
    icon: Soup,
    color: '#F59E0B',
    bg: ['#FFFBEB', '#FEF3C7'],
    img: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&q=80'
  }, {
    title: 'Quinoa Buddha Bowl',
    type: 'Lunch',
    time: '15m',
    calories: '450',
    icon: Salad,
    color: '#059669',
    bg: ['#ECFDF5', '#D1FAE5'],
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80'
  }, {
    title: 'Baked Salmon with Lemon',
    type: 'Dinner',
    time: '25m',
    calories: '550',
    icon: Fish,
    color: '#EF4444',
    bg: ['#FFF1F2', '#FFE4E6'],
    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80'
  }, {
    title: 'Greek Yogurt & Honey',
    type: 'Snack',
    time: '2m',
    calories: '150',
    icon: IceCreamCone,
    color: '#8B5CF6',
    bg: ['#F5F3FF', '#EDE9FE'],
    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80'
  }];
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, Theme.colors.backgroundMid, '#E8FDF3']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#374151" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("DailyRecommendationsScreen.Today_s_Picks")}</Text>
        <View style={styles.sparkleBox}>
          <Sparkles size={20} color="#F59E0B" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
      paddingBottom: 40
    }}>
        {/* Intro */}
        <View style={styles.introBox}>
          <View style={styles.introBadge}>
            <LinearGradient colors={['#059669', '#10B981']} style={StyleSheet.absoluteFill} borderRadius={8} />
            <Text style={styles.introBadgeText}>{t("DailyRecommendationsScreen.DAILY_CURATION")}</Text>
          </View>
          <Text style={styles.introTitle}>{t("DailyRecommendationsScreen.Personalized_for_you")}</Text>
          <Text style={styles.introDesc}>{t("DailyRecommendationsScreen.Based_on_your_pantry_stock_ex")}</Text>
        </View>

        {/* Recipe Cards */}
        <View style={styles.list}>
          {recommendations.map((item, index) => <TouchableOpacity key={index} activeOpacity={0.9} style={styles.cardWrapper}>
              <View style={styles.card}>
                <Image source={{
              uri: item.img
            }} style={styles.cardImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardGrad}>
                  <View style={styles.cardTop}>
                    <View style={[styles.typeBadge, {
                  backgroundColor: item.color
                }]}>
                      <item.icon size={12} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottom}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Clock size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.metaText}>{item.time}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Flame size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.metaText}>{item.calories}{t("DailyRecommendationsScreen.kcal")}</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
                <View style={styles.playBtn}>
                  <LinearGradient colors={[Theme.colors.card, '#F9FAFB']} style={styles.playBtnGrad}>
                    <Play size={16} color="#059669" fill="#059669" />
                  </LinearGradient>
                </View>
              </View>
            </TouchableOpacity>)}
        </View>

        {/* AI Insight */}
        <View style={styles.insightWrapper}>
          <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={styles.insightCard}>
            <View style={styles.insightTop}>
              <View style={styles.insightIconBg}>
                <Lightbulb size={20} color="#F59E0B" />
              </View>
              <Text style={styles.insightTitle}>{t("DailyRecommendationsScreen.Smart_Insight")}</Text>
            </View>
            <Text style={styles.insightText}>{t("DailyRecommendationsScreen.These_recipes_prioritize_using")}<Text style={styles.insightHighlight}>{t("DailyRecommendationsScreen.Salmon")}</Text>{t("DailyRecommendationsScreen.and")}<Text style={styles.insightHighlight}>{t("DailyRecommendationsScreen.Spinach")}</Text>{t("DailyRecommendationsScreen._which_are_expiring_within_th")}</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text
  },
  sparkleBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  introBox: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 10
  },
  introBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  introBadgeText: {
    color: Theme.colors.card,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text
  },
  introDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: '90%'
  },
  list: {
    paddingHorizontal: 20,
    gap: 16
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6
  },
  card: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Theme.colors.card
  },
  cardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  cardGrad: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6
  },
  typeText: {
    color: Theme.colors.card,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  cardBottom: {
    gap: 6
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.card,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {
      width: 0,
      height: 2
    },
    textShadowRadius: 4
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600'
  },
  playBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden'
  },
  playBtnGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  insightWrapper: {
    paddingHorizontal: 20,
    marginTop: 24
  },
  insightCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  insightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  insightIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center'
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E'
  },
  insightText: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 22
  },
  insightHighlight: {
    fontWeight: '700',
    color: '#78350F'
  }
});
export default DailyRecommendationsScreen;