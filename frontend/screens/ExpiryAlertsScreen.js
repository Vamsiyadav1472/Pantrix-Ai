import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { Milk, Leaf, Drumstick, Egg, AlertTriangle, ChevronLeft } from 'lucide-react-native';
const ExpiryAlertsScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const alerts = [{
    id: '1',
    name: 'Milk',
    days: '2 days',
    status: 'Urgent',
    icon: '🥛',
    color: Theme.colors.warning,
    bg: Theme.colors.warningLight
  }, {
    id: '2',
    name: 'Spinach',
    days: '3 days',
    status: 'Soon',
    icon: '🥬',
    color: Theme.colors.primary,
    bg: Theme.colors.primaryLight
  }, {
    id: '3',
    name: 'Chicken',
    days: 'Today',
    status: 'Critical',
    icon: '🍗',
    color: Theme.colors.danger,
    bg: Theme.colors.dangerLight
  }, {
    id: '4',
    name: 'Eggs',
    days: '5 days',
    status: 'Watch',
    icon: '🥚',
    color: '#8B5CF6',
    bg: '#EDE9FE'
  }, {
    id: '5',
    name: 'Yogurt',
    days: '1 day',
    status: 'Urgent',
    icon: '🫙',
    color: Theme.colors.warning,
    bg: Theme.colors.warningLight
  }];
  const getStatusStyle = status => {
    switch (status) {
      case 'Critical':
        return {
          color: Theme.colors.danger,
          bg: Theme.colors.dangerLight
        };
      case 'Urgent':
        return {
          color: '#D97706',
          bg: '#FEF3C7'
        };
      case 'Soon':
        return {
          color: Theme.colors.primary,
          bg: Theme.colors.primaryLight
        };
      default:
        return {
          color: '#8B5CF6',
          bg: '#EDE9FE'
        };
    }
  };
  const renderAlert = ({
    item
  }) => {
    const statusStyle = getStatusStyle(item.status);
    return <View style={styles.card}>
        <View style={[styles.iconBox, {
        backgroundColor: item.bg
      }]}>
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.expiryInfo}>{t("ExpiryAlertsScreen.Expires_in")}{item.days}</Text>
        </View>
        <View style={[styles.statusBadge, {
        backgroundColor: statusStyle.bg
      }]}>
          <View style={[styles.statusDot, {
          backgroundColor: statusStyle.color
        }]} />
          <Text style={[styles.statusText, {
          color: statusStyle.color
        }]}>{item.status}</Text>
        </View>
      </View>;
  };
  const criticalCount = alerts.filter(a => a.status === 'Critical').length;
  const urgentCount = alerts.filter(a => a.status === 'Urgent').length;
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        {/* Header */}
        {navigation && <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={22} color={Theme.colors.text} />
          </TouchableOpacity>}

        <View style={styles.header}>
          <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.headerIconBg} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }}>
            <AlertTriangle size={28} color="#D97706" strokeWidth={2} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>{t("ExpiryAlertsScreen.Expiry_Alerts")}</Text>
            <Text style={styles.count}>{alerts.length}{t("ExpiryAlertsScreen.items_need_attention")}</Text>
          </View>
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryChip, {
          backgroundColor: Theme.colors.dangerLight,
          borderColor: 'rgba(239,68,68,0.2)'
        }]}>
            <View style={[styles.sumDot, {
            backgroundColor: Theme.colors.danger
          }]} />
            <Text style={[styles.sumLabel, {
            color: Theme.colors.danger
          }]}>{criticalCount}{t("ExpiryAlertsScreen.Critical")}</Text>
          </View>
          <View style={[styles.summaryChip, {
          backgroundColor: '#FEF3C7',
          borderColor: 'rgba(245,158,11,0.2)'
        }]}>
            <View style={[styles.sumDot, {
            backgroundColor: '#D97706'
          }]} />
            <Text style={[styles.sumLabel, {
            color: '#D97706'
          }]}>{urgentCount}{t("ExpiryAlertsScreen.Urgent")}</Text>
          </View>
          <View style={[styles.summaryChip, {
          backgroundColor: Theme.colors.primaryLight,
          borderColor: 'rgba(34,197,94,0.2)'
        }]}>
            <View style={[styles.sumDot, {
            backgroundColor: Theme.colors.primary
          }]} />
            <Text style={[styles.sumLabel, {
            color: Theme.colors.primaryDark
          }]}>{alerts.length - criticalCount - urgentCount}{t("ExpiryAlertsScreen.Watch")}</Text>
          </View>
        </View>

        <FlatList data={alerts} renderItem={renderAlert} keyExtractor={item => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
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
  backBtn: {
    marginLeft: 20,
    marginTop: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xs
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  headerIconBg: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xs
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 26,
    color: Theme.colors.text,
    letterSpacing: -0.5
  },
  count: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 16
  },
  summaryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1
  },
  sumDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  sumLabel: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 110
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: 'center',
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    gap: 14
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconEmoji: {
    fontSize: 26
  },
  info: {
    flex: 1
  },
  itemName: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: Theme.colors.text
  },
  expiryInfo: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12
  }
});
export default ExpiryAlertsScreen;