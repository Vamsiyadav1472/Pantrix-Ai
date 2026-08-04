import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, TrendingDown, TrendingUp, Lightbulb, ChevronRight, AlertTriangle } from 'lucide-react-native';
const {
  width
} = Dimensions.get('window');
const WasteTrackingScreen = () => {
  const {
    t
  } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const periods = ['Week', 'Month', 'Year'];
  const wastedItems = [{
    name: 'Spinach',
    count: 4,
    emoji: '🥬',
    trend: 'up',
    value: '$6.40'
  }, {
    name: 'Milk',
    count: 3,
    emoji: '🥛',
    trend: 'down',
    value: '$4.20'
  }, {
    name: 'Bread',
    count: 2,
    emoji: '🍞',
    trend: 'down',
    value: '$3.80'
  }, {
    name: 'Tomatoes',
    count: 2,
    emoji: '🍅',
    trend: 'up',
    value: '$2.60'
  }, {
    name: 'Yogurt',
    count: 1,
    emoji: '🫙',
    trend: 'down',
    value: '$1.80'
  }];
  const weeklyData = [18, 24, 16, 30, 22, 12, 20];
  const maxVal = Math.max(...weeklyData);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, '#FFF1F2', '#FFE4E6']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{t("WasteTrackingScreen.SUSTAINABILITY")}</Text>
          <Text style={styles.headerTitle}>{t("WasteTrackingScreen.Waste_Tracking")}</Text>
        </View>
        <LinearGradient colors={['#EF4444', '#F87171']} style={styles.headerIconBg}>
          <Trash2 size={20} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
      paddingBottom: 40
    }}>
        {/* Main Waste Card */}
        <View style={styles.cardWrapper}>
          <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.heroCard} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>{t("WasteTrackingScreen.Monthly_Food_Waste")}</Text>
                <Text style={styles.heroValue}>$24.50</Text>
                <View style={styles.heroBadge}>
                  <AlertTriangle size={11} color="#FCA5A5" />
                  <Text style={styles.heroBadgeText}>{t("WasteTrackingScreen.15_more_than_last_month")}</Text>
                </View>
              </View>
              <Text style={styles.heroEmoji}>🗑️</Text>
            </View>

            {/* Period Selector */}
            <View style={styles.periodRow}>
              {periods.map(p => <TouchableOpacity key={p} style={[styles.periodBtn, selectedPeriod === p && styles.activePeriodBtn]} onPress={() => setSelectedPeriod(p)}>
                  <Text style={[styles.periodText, selectedPeriod === p && styles.activePeriodText]}>{p}</Text>
                </TouchableOpacity>)}
            </View>
          </LinearGradient>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>{t("WasteTrackingScreen.Weekly_Waste_Pattern")}</Text>
          <View style={styles.chartArea}>
            {weeklyData.map((val, i) => <View key={i} style={styles.barCol}>
                <Text style={styles.barValue}>${val}</Text>
                <LinearGradient colors={val === maxVal ? ['#EF4444', '#F87171'] : ['#FCA5A5', '#FECACA']} style={[styles.barFill, {
              height: val / maxVal * 80 + 10
            }]} />
                <Text style={styles.barDay}>{days[i]}</Text>
              </View>)}
          </View>
        </View>

        {/* Most Wasted Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("WasteTrackingScreen.Most_Wasted_Items")}</Text>
          <View style={styles.itemList}>
            {wastedItems.map((item, i) => <TouchableOpacity key={i} style={styles.itemRow} activeOpacity={0.8}>
                <View style={styles.itemLeft}>
                  <View style={styles.itemEmojiBg}>
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  </View>
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemSub}>{item.count}{t("WasteTrackingScreen._this_month")}</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemValue}>{item.value}</Text>
                  {item.trend === 'up' ? <TrendingUp size={14} color="#EF4444" /> : <TrendingDown size={14} color="#10B981" />}
                </View>
              </TouchableOpacity>)}
          </View>
        </View>

        {/* AI Suggestion */}
        <View style={styles.tipCardWrapper}>
          <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.tipIconBg}>
                <Lightbulb size={16} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.tipTitle}>{t("WasteTrackingScreen.AI_Suggestion")}</Text>
            </View>
            <Text style={styles.tipDesc}>{t("WasteTrackingScreen.You_frequently_waste")}<Text style={{
              fontWeight: '700',
              color: '#92400E'
            }}>{t("WasteTrackingScreen.Spinach")}</Text>{t("WasteTrackingScreen._Try_buying_smaller_portions")}<Text style={{
              fontWeight: '700',
              color: '#92400E'
            }}>{t("WasteTrackingScreen._25_month")}</Text>.
            </Text>
            <TouchableOpacity style={styles.tipAction}>
              <Text style={styles.tipActionText}>{t("WasteTrackingScreen.See_All_Tips")}</Text>
              <ChevronRight size={14} color="#D97706" />
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
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
  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  heroCard: {
    borderRadius: 24,
    padding: 24
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
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
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  heroBadgeText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '600'
  },
  heroEmoji: {
    fontSize: 48
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: 4,
    gap: 4
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  activePeriodBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)'
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)'
  },
  activePeriodText: {
    color: Theme.colors.card
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 16
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
    width: 22,
    borderRadius: 6,
    minHeight: 10
  },
  barDay: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500'
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20
  },
  itemList: {
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB'
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  itemEmojiBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemEmoji: {
    fontSize: 22
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text
  },
  itemSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444'
  },
  tipCardWrapper: {
    paddingHorizontal: 20
  },
  tipCard: {
    borderRadius: 20,
    padding: 20
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  tipIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E'
  },
  tipDesc: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 22,
    marginBottom: 14
  },
  tipAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  tipActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706'
  }
});
export default WasteTrackingScreen;