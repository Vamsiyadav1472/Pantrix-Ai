import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, TrendingUp, Award, Target, Zap, ChevronRight } from 'lucide-react-native';
const {
  width
} = Dimensions.get('window');
const SavingsDashboardScreen = () => {
  const {
    t
  } = useTranslation();
  const monthlyData = [{
    month: 'Jan',
    saved: 30,
    bg: ['#DBEAFE', '#BFDBFE']
  }, {
    month: 'Feb',
    saved: 55,
    bg: ['#D1FAE5', '#A7F3D0']
  }, {
    month: 'Mar',
    saved: 40,
    bg: ['#FEF3C7', '#FDE68A']
  }, {
    month: 'Apr',
    saved: 120,
    bg: ['#D1FAE5', '#A7F3D0']
  }, {
    month: 'May',
    saved: 45,
    bg: ['#FFF1F2', '#FECDD3']
  }, {
    month: 'Jun',
    saved: 90,
    bg: ['#D1FAE5', '#A7F3D0']
  }];
  const achievements = [{
    emoji: '🏆',
    title: 'Smart Shopper',
    desc: 'Saved $45 this week!',
    color: '#F59E0B'
  }, {
    emoji: '🌿',
    title: 'Eco Champion',
    desc: 'Reduced waste by 65%',
    color: '#10B981'
  }, {
    emoji: '⭐',
    title: 'Top 5%',
    desc: 'Among all PantrixAI users',
    color: '#8B5CF6'
  }];
  const maxSaved = Math.max(...monthlyData.map(d => d.saved));
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, Theme.colors.backgroundMid, '#E8FDF3']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{t("SavingsDashboardScreen.FINANCIAL_IMPACT")}</Text>
          <Text style={styles.headerTitle}>{t("SavingsDashboardScreen.Savings_Dashboard")}</Text>
        </View>
        <LinearGradient colors={['#059669', '#10B981']} style={styles.headerIconBg}>
          <DollarSign size={20} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
      paddingBottom: 40
    }}>
        {/* Hero Savings Card */}
        <View style={styles.heroWrapper}>
          <LinearGradient colors={['#059669', '#10B981', '#34D399']} style={styles.heroCard} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>{t("SavingsDashboardScreen.Total_Saved_This_Year")}</Text>
                <Text style={styles.heroValue}>$420.50</Text>
                <View style={styles.heroTrend}>
                  <TrendingUp size={14} color="#A7F3D0" />
                  <Text style={styles.heroTrendText}>{t("SavingsDashboardScreen._18_vs_last_year")}</Text>
                </View>
              </View>
              <View style={styles.heroIconBg}>
                <Text style={styles.heroEmoji}>💰</Text>
              </View>
            </View>

            {/* Mini Stats */}
            <View style={styles.miniStats}>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>65%</Text>
                <Text style={styles.miniStatLabel}>{t("SavingsDashboardScreen.Waste_Reduced")}</Text>
              </View>
              <View style={styles.miniDivider} />
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>✅</Text>
                <Text style={styles.miniStatLabel}>{t("SavingsDashboardScreen.Budget_Goal")}</Text>
              </View>
              <View style={styles.miniDivider} />
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>{t("SavingsDashboardScreen.Top_5")}</Text>
                <Text style={styles.miniStatLabel}>{t("SavingsDashboardScreen.User_Ranking")}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Monthly Comparison Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>{t("SavingsDashboardScreen.Monthly_Savings")}</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>{t("SavingsDashboardScreen.View_All")}</Text>
              <ChevronRight size={14} color="#059669" />
            </TouchableOpacity>
          </View>
          <View style={styles.chartArea}>
            {monthlyData.map((d, i) => <View key={i} style={styles.barCol}>
                <Text style={styles.barValue}>${d.saved}</Text>
                <LinearGradient colors={d.saved === maxSaved ? ['#059669', '#10B981'] : ['#D1FAE5', '#A7F3D0']} style={[styles.barFill, {
              height: d.saved / maxSaved * 90 + 8
            }]} />
                <Text style={styles.barMonth}>{d.month}</Text>
              </View>)}
          </View>
        </View>

        {/* Goals Card */}
        <View style={styles.goalsCard}>
          <View style={styles.goalsHeader}>
            <Target size={18} color="#059669" strokeWidth={2} />
            <Text style={styles.sectionTitle}>{t("SavingsDashboardScreen.Monthly_Goal_Progress")}</Text>
          </View>
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalLabel}>{t("SavingsDashboardScreen.Food_Budget")}</Text>
              <Text style={styles.goalValues}>$90 / $150</Text>
            </View>
            <View style={styles.goalTrack}>
              <LinearGradient colors={['#059669', '#10B981']} style={[styles.goalFill, {
              width: '60%'
            }]} />
            </View>
          </View>
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalLabel}>{t("SavingsDashboardScreen.Waste_Reduction")}</Text>
              <Text style={styles.goalValues}>65% / 80%</Text>
            </View>
            <View style={styles.goalTrack}>
              <LinearGradient colors={['#3B82F6', '#60A5FA']} style={[styles.goalFill, {
              width: '81%'
            }]} />
            </View>
          </View>
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalLabel}>{t("SavingsDashboardScreen.Meal_Planning")}</Text>
              <Text style={styles.goalValues}>{t("SavingsDashboardScreen.4_5_meals")}</Text>
            </View>
            <View style={styles.goalTrack}>
              <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={[styles.goalFill, {
              width: '80%'
            }]} />
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>{t("SavingsDashboardScreen.Your_Achievements")}</Text>
          <View style={styles.achievementList}>
            {achievements.map((ach, i) => <TouchableOpacity key={i} style={styles.achCard} activeOpacity={0.85}>
                <View style={[styles.achEmojiBox, {
              backgroundColor: ach.color + '18'
            }]}>
                  <Text style={styles.achEmoji}>{ach.emoji}</Text>
                </View>
                <View style={styles.achText}>
                  <Text style={styles.achTitle}>{ach.title}</Text>
                  <Text style={styles.achDesc}>{ach.desc}</Text>
                </View>
                <View style={[styles.achBadge, {
              backgroundColor: ach.color + '15'
            }]}>
                  <Zap size={12} color={ach.color} />
                </View>
              </TouchableOpacity>)}
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
  heroWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  heroCard: {
    borderRadius: 28,
    padding: 24
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600'
  },
  heroValue: {
    color: Theme.colors.card,
    fontSize: 48,
    fontWeight: '900',
    marginVertical: 4
  },
  heroTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  heroTrendText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '600'
  },
  heroIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroEmoji: {
    fontSize: 32
  },
  miniStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around'
  },
  miniStat: {
    alignItems: 'center'
  },
  miniStatValue: {
    color: Theme.colors.card,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2
  },
  miniStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11
  },
  miniDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  chartCard: {
    marginHorizontal: 20,
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  viewAllText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600'
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6
  },
  barValue: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600'
  },
  barFill: {
    width: 24,
    borderRadius: 6,
    minHeight: 8
  },
  barMonth: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500'
  },
  goalsCard: {
    marginHorizontal: 20,
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  goalItem: {
    marginBottom: 16
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  goalLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500'
  },
  goalValues: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600'
  },
  goalTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden'
  },
  goalFill: {
    height: '100%',
    borderRadius: 4
  },
  achievementsSection: {
    paddingHorizontal: 20
  },
  achievementList: {
    gap: 12,
    marginTop: 12
  },
  achCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  achEmojiBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  achEmoji: {
    fontSize: 24
  },
  achText: {
    flex: 1
  },
  achTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text
  },
  achDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  achBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
export default SavingsDashboardScreen;