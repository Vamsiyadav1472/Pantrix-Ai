import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart2, TrendingUp, Filter, ChevronRight, Activity, Calendar } from 'lucide-react-native';
const {
  width
} = Dimensions.get('window');
const UsageAnalyticsScreen = () => {
  const {
    t
  } = useTranslation();
  const [activeTab, setActiveTab] = useState('Month');
  const tabs = ['Week', 'Month', 'Year'];
  const categories = [{
    name: 'Produce',
    percent: 45,
    color: '#10B981',
    bg: ['#D1FAE5', '#A7F3D0'],
    emoji: '🥬'
  }, {
    name: 'Dairy',
    percent: 25,
    color: '#3B82F6',
    bg: ['#DBEAFE', '#BFDBFE'],
    emoji: '🥛'
  }, {
    name: 'Dry Goods',
    percent: 20,
    color: '#F59E0B',
    bg: ['#FEF3C7', '#FDE68A'],
    emoji: '🌾'
  }, {
    name: 'Other',
    percent: 10,
    color: '#8B5CF6',
    bg: ['#F5F3FF', '#EDE9FE'],
    emoji: '🥫'
  }];
  const weeklyData = [40, 70, 50, 90, 60, 80, 45];
  const maxWeekly = Math.max(...weeklyData);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, Theme.colors.backgroundMid, '#E8FDF3']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{t("UsageAnalyticsScreen.STATISTICS")}</Text>
          <Text style={styles.headerTitle}>{t("UsageAnalyticsScreen.Usage_Analytics")}</Text>
        </View>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.headerIconBg}>
          <BarChart2 size={20} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
      paddingBottom: 40
    }}>
        {/* Main Stats Card */}
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
                <Text style={styles.heroLabel}>{t("UsageAnalyticsScreen.Total_Items_Consumed")}</Text>
                <Text style={styles.heroValue}>156</Text>
                <View style={styles.heroTrend}>
                  <TrendingUp size={14} color="#A7F3D0" />
                  <Text style={styles.heroTrendText}>{t("UsageAnalyticsScreen._12_from_last_month")}</Text>
                </View>
              </View>
              <View style={styles.heroIconBg}>
                <Activity size={28} color="#FFFFFF" />
              </View>
            </View>

            {/* Time Filter Tabs */}
            <View style={styles.tabRow}>
              {tabs.map(tab => <TouchableOpacity key={tab} style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]} onPress={() => setActiveTab(tab)}>
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>)}
            </View>
          </LinearGradient>
        </View>

        {/* Top Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("UsageAnalyticsScreen.Top_Categories")}</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>{t("UsageAnalyticsScreen.Details")}</Text>
              <ChevronRight size={14} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <View style={styles.catCard}>
            {categories.map((cat, i) => <View key={i} style={styles.catRow}>
                <View style={styles.catLeft}>
                  <LinearGradient colors={cat.bg} style={styles.catEmojiBg}>
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  </LinearGradient>
                  <View>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catSub}>{cat.percent}{t("UsageAnalyticsScreen._of_total")}</Text>
                  </View>
                </View>
                <View style={styles.catRight}>
                  <Text style={styles.catPercent}>{cat.percent}%</Text>
                  <View style={styles.progressTrack}>
                    <LinearGradient colors={[cat.color, cat.color + '99']} style={[styles.progressFill, {
                  width: `${cat.percent}%`
                }]} start={{
                  x: 0,
                  y: 0
                }} end={{
                  x: 1,
                  y: 0
                }} />
                  </View>
                </View>
              </View>)}
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Calendar size={18} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.chartTitle}>{t("UsageAnalyticsScreen.Weekly_Usage_Frequency")}</Text>
          </View>
          
          <View style={styles.chartArea}>
            {weeklyData.map((val, i) => <View key={i} style={styles.barCol}>
                <Text style={styles.barValue}>{val}</Text>
                <LinearGradient colors={val === maxWeekly ? ['#3B82F6', '#60A5FA'] : ['#DBEAFE', '#EFF6FF']} style={[styles.barFill, {
              height: val / maxWeekly * 100 + 10
            }]} />
                <Text style={[styles.barDay, val === maxWeekly && {
              color: '#3B82F6',
              fontWeight: '700'
            }]}>{days[i]}</Text>
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
    color: '#3B82F6',
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
    marginBottom: 24
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600'
  },
  heroValue: {
    color: Theme.colors.card,
    fontSize: 52,
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
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 14,
    padding: 4
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  activeTabBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)'
  },
  activeTabText: {
    color: Theme.colors.card
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
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
    color: '#3B82F6',
    fontWeight: '600'
  },
  catCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    padding: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  catEmojiBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  catEmoji: {
    fontSize: 20
  },
  catName: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text
  },
  catSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  catRight: {
    width: 80,
    alignItems: 'flex-end',
    gap: 6
  },
  catPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151'
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  chartCard: {
    marginHorizontal: 20,
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 10
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6
  },
  barValue: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600'
  },
  barFill: {
    width: 24,
    borderRadius: 8,
    minHeight: 10
  },
  barDay: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500'
  }
});
export default UsageAnalyticsScreen;