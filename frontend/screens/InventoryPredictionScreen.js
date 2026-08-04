import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, TrendingDown, ShoppingCart, AlertCircle, ChevronRight, Zap } from 'lucide-react-native';
import { Theme } from '../theme';
const {
  width
} = Dimensions.get('window');
const InventoryPredictionScreen = () => {
  const {
    t
  } = useTranslation();
  const predictions = [{
    name: 'Milk',
    daysLeft: 2,
    status: 'Critical',
    emoji: '🥛',
    statusColor: '#EF4444',
    statusBg: '#FFF1F2',
    progress: 0.15,
    progressColor: ['#EF4444', '#F87171'],
    action: 'Order Now'
  }, {
    name: 'Coffee Beans',
    daysLeft: 5,
    status: 'Low',
    emoji: '☕',
    statusColor: '#F59E0B',
    statusBg: '#FFFBEB',
    progress: 0.35,
    progressColor: ['#F59E0B', '#FCD34D'],
    action: 'Add to List'
  }, {
    name: 'Pasta',
    daysLeft: 12,
    status: 'Healthy',
    emoji: '🍝',
    statusColor: '#059669',
    statusBg: '#ECFDF5',
    progress: 0.75,
    progressColor: ['#059669', '#10B981'],
    action: 'On Track'
  }, {
    name: 'Olive Oil',
    daysLeft: 3,
    status: 'Low',
    emoji: '🫙',
    statusColor: '#F59E0B',
    statusBg: '#FFFBEB',
    progress: 0.25,
    progressColor: ['#F59E0B', '#FCD34D'],
    action: 'Add to List'
  }, {
    name: 'Eggs',
    daysLeft: 20,
    status: 'Healthy',
    emoji: '🥚',
    statusColor: '#059669',
    statusBg: '#ECFDF5',
    progress: 0.9,
    progressColor: ['#059669', '#34D399'],
    action: 'On Track'
  }];
  const criticalCount = predictions.filter(p => p.status === 'Critical').length;
  const lowCount = predictions.filter(p => p.status === 'Low').length;
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, Theme.colors.backgroundMid, '#E8FDF3']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>{t("InventoryPredictionScreen.AI_POWERED")}</Text>
          <Text style={styles.headerTitle}>{t("InventoryPredictionScreen.Inventory_Forecast")}</Text>
        </View>
        <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.headerIconBg}>
          <Brain size={20} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
      paddingBottom: 40
    }}>
        {/* Overview Cards */}
        <View style={styles.overviewRow}>
          <LinearGradient colors={['#FFF1F2', '#FFE4E6']} style={styles.overviewCard}>
            <AlertCircle size={20} color="#EF4444" strokeWidth={2} />
            <Text style={styles.overviewNum}>{criticalCount}</Text>
            <Text style={styles.overviewLabel}>{t("InventoryPredictionScreen.Critical")}</Text>
          </LinearGradient>
          <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={styles.overviewCard}>
            <TrendingDown size={20} color="#F59E0B" strokeWidth={2} />
            <Text style={styles.overviewNum}>{lowCount}</Text>
            <Text style={styles.overviewLabel}>{t("InventoryPredictionScreen.Running_Low")}</Text>
          </LinearGradient>
          <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.overviewCard}>
            <Zap size={20} color="#059669" strokeWidth={2} />
            <Text style={styles.overviewNum}>{predictions.length - criticalCount - lowCount}</Text>
            <Text style={styles.overviewLabel}>{t("InventoryPredictionScreen.Healthy")}</Text>
          </LinearGradient>
        </View>

        {/* How it works */}
        <View style={styles.infoCard}>
          <LinearGradient colors={[Theme.colors.backgroundMid, '#D1FAE5']} style={styles.infoCardGrad}>
            <Brain size={18} color="#059669" strokeWidth={2} />
            <View style={{
            flex: 1,
            marginLeft: 12
          }}>
              <Text style={styles.infoTitle}>{t("InventoryPredictionScreen.How_AI_Prediction_Works")}</Text>
              <Text style={styles.infoText}>{t("InventoryPredictionScreen.We_analyze_your_consumption_pa")}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Predictions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("InventoryPredictionScreen.Stock_Forecast")}</Text>
          <View style={styles.predictionList}>
            {predictions.map((item, i) => <TouchableOpacity key={i} style={styles.predCard} activeOpacity={0.85}>
                <View style={[styles.emojiBox, {
              backgroundColor: item.statusBg
            }]}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>
                <View style={styles.predInfo}>
                  <View style={styles.predTop}>
                    <Text style={styles.predName}>{item.name}</Text>
                    <View style={[styles.statusPill, {
                  backgroundColor: item.statusBg
                }]}>
                      <Text style={[styles.statusText, {
                    color: item.statusColor
                  }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.predDays}>
                    {item.status === 'Critical' ? `⚠️ Only ${item.daysLeft} days left` : `~${item.daysLeft} days remaining`}
                  </Text>
                  <View style={styles.progressTrack}>
                    <LinearGradient colors={item.progressColor} style={[styles.progressFill, {
                  width: `${item.progress * 100}%`
                }]} start={{
                  x: 0,
                  y: 0
                }} end={{
                  x: 1,
                  y: 0
                }} />
                  </View>
                </View>
                {item.status !== 'Healthy' && <TouchableOpacity style={[styles.actionBtn, {
              backgroundColor: item.statusColor
            }]}>
                    <ShoppingCart size={14} color="#FFFFFF" strokeWidth={2} />
                  </TouchableOpacity>}
              </TouchableOpacity>)}
          </View>
        </View>

        {/* Auto-reorder suggestion */}
        <View style={styles.autoCard}>
          <LinearGradient colors={['#EDE9FE', '#DDD6FE']} style={styles.autoCardGrad}>
            <View style={styles.autoTop}>
              <View style={styles.autoIconBg}>
                <Zap size={18} color="#7C3AED" strokeWidth={2} />
              </View>
              <View style={{
              flex: 1
            }}>
                <Text style={styles.autoTitle}>{t("InventoryPredictionScreen.Smart_Auto_Reorder")}</Text>
                <Text style={styles.autoDesc}>{t("InventoryPredictionScreen.Enable_automatic_shopping_list")}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.enableBtn}>
              <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.enableBtnGrad}>
                <Text style={styles.enableBtnText}>{t("InventoryPredictionScreen.Enable_Auto_Reorder")}</Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </LinearGradient>
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
    color: '#7C3AED',
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
  overviewRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16
  },
  overviewCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 6
  },
  overviewNum: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text
  },
  overviewLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center'
  },
  infoCard: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  infoCardGrad: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    padding: 18
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4
  },
  infoText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 19
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 14
  },
  predictionList: {
    gap: 12
  },
  predCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  emojiBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emoji: {
    fontSize: 26
  },
  predInfo: {
    flex: 1
  },
  predTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  predName: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700'
  },
  predDays: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  autoCard: {
    paddingHorizontal: 20
  },
  autoCardGrad: {
    borderRadius: 24,
    padding: 20
  },
  autoTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16
  },
  autoIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(124,58,237,0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  autoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4C1D95',
    marginBottom: 4
  },
  autoDesc: {
    fontSize: 13,
    color: '#6D28D9',
    lineHeight: 19
  },
  enableBtn: {
    borderRadius: 14,
    overflow: 'hidden'
  },
  enableBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderRadius: 14
  },
  enableBtnText: {
    color: Theme.colors.card,
    fontSize: 15,
    fontWeight: '700'
  }
});
export default InventoryPredictionScreen;