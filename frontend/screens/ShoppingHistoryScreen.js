import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag, ChevronRight, Calendar, ArrowRight, TrendingDown } from 'lucide-react-native';
const ShoppingHistoryScreen = () => {
  const {
    t
  } = useTranslation();
  const history = [{
    id: '1',
    date: 'May 1, 2026',
    items: 12,
    cost: '$45.20',
    saved: '$5.50',
    bg: [Theme.colors.backgroundMid, '#D1FAE5'],
    color: '#059669'
  }, {
    id: '2',
    date: 'Apr 24, 2026',
    items: 8,
    cost: '$32.10',
    saved: '$2.00',
    bg: ['#EFF6FF', '#DBEAFE'],
    color: '#3B82F6'
  }, {
    id: '3',
    date: 'Apr 17, 2026',
    items: 15,
    cost: '$68.50',
    saved: '$12.40',
    bg: ['#FFFBEB', '#FEF3C7'],
    color: '#F59E0B'
  }, {
    id: '4',
    date: 'Apr 10, 2026',
    items: 5,
    cost: '$18.90',
    saved: '$0.00',
    bg: ['#F3F4F6', '#E5E7EB'],
    color: '#6B7280'
  }];
  const renderHistory = ({
    item
  }) => <TouchableOpacity style={styles.cardWrapper} activeOpacity={0.85}>
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <LinearGradient colors={item.bg} style={styles.iconBg}>
            <ShoppingBag size={20} color={item.color} strokeWidth={2} />
          </LinearGradient>
          <View>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.itemMeta}>
              <Text style={styles.items}>{item.items}{t("ShoppingHistoryScreen.items")}</Text>
              {item.saved !== '$0.00' && <>
                  <Text style={styles.dot}>•</Text>
                  <View style={styles.savedPill}>
                    <TrendingDown size={10} color="#059669" />
                    <Text style={styles.savedText}>{t("ShoppingHistoryScreen.Saved")}{item.saved}</Text>
                  </View>
                </>}
            </View>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cost}>{item.cost}</Text>
          <View style={styles.arrowBg}>
            <ChevronRight size={16} color="#9CA3AF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>;
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, Theme.colors.backgroundMid, '#E8FDF3']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{t("ShoppingHistoryScreen.ACTIVITY")}</Text>
          <Text style={styles.title}>{t("ShoppingHistoryScreen.Shopping_History")}</Text>
        </View>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.headerIconBg}>
          <Calendar size={20} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </View>

      {/* Monthly Summary */}
      <View style={styles.summaryWrapper}>
        <LinearGradient colors={[Theme.colors.textMuted, Theme.colors.text]} style={styles.summaryCard} start={{
        x: 0,
        y: 0
      }} end={{
        x: 1,
        y: 1
      }}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>{t("ShoppingHistoryScreen.Total_Spent_Last_30_Days")}</Text>
            <Text style={styles.summaryValue}>$164.70</Text>
          </View>
          <View style={styles.summaryBottom}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t("ShoppingHistoryScreen.Trips")}</Text>
              <Text style={styles.statValue}>4</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t("ShoppingHistoryScreen.Total_Saved")}</Text>
              <Text style={[styles.statValue, {
              color: '#34D399'
            }]}>$19.90</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{t("ShoppingHistoryScreen.Recent_Receipts")}</Text>
      </View>

      <FlatList data={history} renderItem={renderHistory} keyExtractor={item => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
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
  title: {
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
  summaryWrapper: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  summaryCard: {
    borderRadius: 24,
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
  summaryTop: {
    marginBottom: 20
  },
  summaryLabel: {
    fontSize: 13,
    color: Theme.colors.textLight,
    fontWeight: '600',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '900',
    color: Theme.colors.card
  },
  summaryBottom: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around'
  },
  statBox: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 11,
    color: Theme.colors.textLight,
    fontWeight: '600',
    marginBottom: 2
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.card
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 12
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  iconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  items: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500'
  },
  dot: {
    fontSize: 12,
    color: '#D1D5DB'
  },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2
  },
  savedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669'
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  cost: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text
  },
  arrowBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
export default ShoppingHistoryScreen;