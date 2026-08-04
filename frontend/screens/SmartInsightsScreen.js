import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, TrendingDown, DollarSign, Leaf, Calendar, ChevronRight, Sparkles } from 'lucide-react-native';
import { Theme } from '../theme';
const {
  width
} = Dimensions.get('window');
const SmartInsightsScreen = () => {
  const {
    t
  } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Waste', 'Savings', 'Nutrition'];
  const insights = [{
    title: 'Waste Alert',
    desc: 'You waste 15% more produce than last month. Consider meal prepping to use greens faster.',
    icon: TrendingDown,
    iconColor: '#EF4444',
    bgGradient: ['#FFF1F2', '#FFE4E6'],
    tag: 'Waste',
    severity: 'warning'
  }, {
    title: 'Money Saver',
    desc: 'Using pantry leftovers saved you $45 this week! Keep tracking to hit your monthly goal.',
    icon: DollarSign,
    iconColor: '#059669',
    bgGradient: ['#ECFDF5', '#D1FAE5'],
    tag: 'Savings',
    severity: 'success'
  }, {
    title: 'Nutrition Fact',
    desc: 'Your pantry is high in protein but low in fiber. Add more whole grains and legumes.',
    icon: Leaf,
    iconColor: '#2563EB',
    bgGradient: ['#EFF6FF', '#DBEAFE'],
    tag: 'Nutrition',
    severity: 'info'
  }, {
    title: 'Shopping Pattern',
    desc: 'You tend to buy milk every 4 days. Subscription delivery could save you 12 trips/month.',
    icon: Calendar,
    iconColor: '#D97706',
    bgGradient: ['#FFFBEB', '#FEF3C7'],
    tag: 'Savings',
    severity: 'tip'
  }];
  const filtered = activeTab === 'All' ? insights : insights.filter(i => i.tag === activeTab);
  const barData = [{
    label: 'Mon',
    value: 65
  }, {
    label: 'Tue',
    value: 90
  }, {
    label: 'Wed',
    value: 50
  }, {
    label: 'Thu',
    value: 120
  }, {
    label: 'Fri',
    value: 80
  }, {
    label: 'Sat',
    value: 100
  }, {
    label: 'Sun',
    value: 70
  }];
  const maxBar = Math.max(...barData.map(d => d.value));
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, Theme.colors.backgroundMid, '#E8FDF3']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{t("SmartInsightsScreen.AI_ANALYSIS")}</Text>
          <Text style={styles.headerTitle}>{t("SmartInsightsScreen.Smart_Insights")}</Text>
        </View>
        <LinearGradient colors={['#059669', '#10B981']} style={styles.headerIconBg}>
          <Brain size={22} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
      paddingBottom: 40
    }}>
        {/* AI Score Card */}
        <View style={styles.scoreCardWrapper}>
          <LinearGradient colors={['#059669', '#10B981', '#34D399']} style={styles.scoreCard} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }}>
            <View style={styles.scoreContent}>
              <View>
                <Text style={styles.scoreLabel}>{t("SmartInsightsScreen.Pantry_Health_Score")}</Text>
                <Text style={styles.scoreValue}>82</Text>
                <View style={styles.scoreBadge}>
                  <Sparkles size={12} color="#FFFFFF" />
                  <Text style={styles.scoreBadgeText}>{t("SmartInsightsScreen.Excellent")}</Text>
                </View>
              </View>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreCircleText}>🧠</Text>
                <Text style={styles.scoreCircleSub}>{t("SmartInsightsScreen.AI_Score")}</Text>
              </View>
            </View>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, {
              width: '82%'
            }]} />
            </View>
            <Text style={styles.scoreBarLabel}>{t("SmartInsightsScreen.You_re_in_the_top_18_of_Pantr")}</Text>
          </LinearGradient>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={{
        paddingHorizontal: 20,
        gap: 10
      }}>
          {tabs.map(tab => <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>)}
        </ScrollView>

        {/* Insight Cards */}
        <View style={{
        paddingHorizontal: 20,
        gap: 14,
        marginTop: 16
      }}>
          {filtered.map((item, index) => <TouchableOpacity key={index} activeOpacity={0.85}>
              <LinearGradient colors={item.bgGradient} style={styles.insightCard}>
                <View style={[styles.insightIconBg, {
              backgroundColor: item.iconColor + '18'
            }]}>
                  <item.icon size={22} color={item.iconColor} strokeWidth={2} />
                </View>
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>{item.title}</Text>
                  <Text style={styles.insightDesc}>{item.desc}</Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </LinearGradient>
            </TouchableOpacity>)}
        </View>

        {/* Consumption Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>{t("SmartInsightsScreen.Consumption_Over_Time")}</Text>
          <Text style={styles.chartSub}>{t("SmartInsightsScreen.Weekly_item_usage_trend")}</Text>
          <View style={styles.chartArea}>
            {barData.map((d, i) => <View key={i} style={styles.barWrapper}>
                <LinearGradient colors={['#059669', '#10B981']} style={[styles.bar, {
              height: d.value / maxBar * 120
            }]} />
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>)}
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 1.5
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.colors.text,
    marginTop: 2
  },
  headerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scoreCardWrapper: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 20
  },
  scoreCard: {
    borderRadius: 24,
    padding: 24
  },
  scoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  scoreValue: {
    color: Theme.colors.card,
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
    marginTop: 2
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  scoreBadgeText: {
    color: Theme.colors.card,
    fontSize: 12,
    fontWeight: '600'
  },
  scoreCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center'
  },
  scoreCircleText: {
    fontSize: 28
  },
  scoreCircleSub: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600'
  },
  scoreBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    marginBottom: 8
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.card,
    borderRadius: 4
  },
  scoreBarLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12
  },
  tabScroll: {
    marginBottom: 4
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  activeTab: {
    backgroundColor: '#059669',
    borderColor: '#059669'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  activeTabText: {
    color: Theme.colors.card
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    gap: 14
  },
  insightIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  insightText: {
    flex: 1
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4
  },
  insightDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19
  },
  chartCard: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text
  },
  chartSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
    marginTop: 2
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140
  },
  barWrapper: {
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  bar: {
    width: 20,
    borderRadius: 6,
    minHeight: 8
  },
  barLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500'
  }
});
export default SmartInsightsScreen;