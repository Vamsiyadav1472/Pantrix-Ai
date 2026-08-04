import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { Bell, ChevronLeft, CheckCheck, AlertTriangle, Info, Sparkles, Clock } from 'lucide-react-native';
import { notificationService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
const NotificationCenterScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchNotifications = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      let userId = 1;
      if (userData) {
        const parsed = JSON.parse(userData);
        userId = parsed.user_id || parsed.id || 1;
      }
      const response = await notificationService.getAll(userId);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback demo notifications
      setNotifications([{
        id: '1',
        title: '🥛 Milk is expiring in 2 days',
        time: '2 hours ago',
        read: false,
        type: 'expiry'
      }, {
        id: '2',
        title: '🤖 New AI recipe generated for you!',
        time: '5 hours ago',
        read: false,
        type: 'ai'
      }, {
        id: '3',
        title: '📋 Your meal plan is ready for tomorrow',
        time: 'Yesterday',
        read: true,
        type: 'plan'
      }, {
        id: '4',
        title: '⚠️ 3 items are about to expire',
        time: '2 days ago',
        read: true,
        type: 'alert'
      }]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, []);
  const getTypeConfig = type => {
    switch (type) {
      case 'expiry':
        return {
          icon: <AlertTriangle size={18} color="#D97706" />,
          bg: '#FEF3C7',
          color: '#D97706'
        };
      case 'ai':
        return {
          icon: <Sparkles size={18} color="#8B5CF6" />,
          bg: '#EDE9FE',
          color: '#8B5CF6'
        };
      case 'plan':
        return {
          icon: <CheckCheck size={18} color={Theme.colors.primary} />,
          bg: Theme.colors.primaryLight,
          color: Theme.colors.primary
        };
      case 'alert':
        return {
          icon: <AlertTriangle size={18} color={Theme.colors.danger} />,
          bg: Theme.colors.dangerLight,
          color: Theme.colors.danger
        };
      default:
        return {
          icon: <Bell size={18} color={Theme.colors.primary} />,
          bg: Theme.colors.primaryLight,
          color: Theme.colors.primary
        };
    }
  };
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({
      ...n,
      read: true
    })));
  };
  const renderItem = ({
    item
  }) => {
    const typeConfig = getTypeConfig(item.type);
    return <TouchableOpacity style={[styles.card, !item.read && styles.unreadCard]} activeOpacity={0.85}>
        {!item.read && <View style={styles.unreadStrip} />}
        <View style={[styles.iconBox, {
        backgroundColor: typeConfig.bg
      }]}>
          {typeConfig.icon}
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.timeRow}>
            <Clock size={11} color={Theme.colors.textLight} />
            <Text style={styles.notifTime}>{item.time}</Text>
          </View>
        </View>
        {!item.read && <View style={[styles.unreadDot, {
        backgroundColor: typeConfig.color
      }]} />}
      </TouchableOpacity>;
  };
  const unreadCount = notifications.filter(n => !n.read).length;
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        {/* Header */}
        <View style={styles.header}>
          {navigation && <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>}
          <View style={{
          flex: 1
        }}>
            <Text style={styles.title}>{t("NotificationCenterScreen.Notifications")}</Text>
            <Text style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </Text>
          </View>
          {unreadCount > 0 && <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn}>
              <CheckCheck size={16} color={Theme.colors.primary} />
              <Text style={styles.markReadText}>{t("NotificationCenterScreen.Mark_all_read")}</Text>
            </TouchableOpacity>}
        </View>

        {loading ? <View style={styles.loader}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          </View> : notifications.length === 0 ? <View style={styles.emptyBox}>
            <View style={[styles.emptyIconBg, { backgroundColor: Theme.colors.primary }]}>
              <Bell size={36} color="#000000" />
            </View>
            <Text style={styles.emptyTitle}>{t("NotificationCenterScreen.All_Quiet_Here")}</Text>
            <Text style={styles.emptyText}>{t("NotificationCenterScreen.You_have_no_notifications_yet")}</Text>
          </View> : <FlatList data={notifications} renderItem={renderItem} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 12
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xs
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 24,
    color: Theme.colors.text,
    letterSpacing: -0.3
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  markReadText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 12,
    color: Theme.colors.primary
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 10
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadows.xs,
    overflow: 'hidden'
  },
  unreadCard: {
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(34,197,94,0.2)'
  },
  unreadStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Theme.colors.primary,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardInfo: {
    flex: 1
  },
  notifTitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    lineHeight: 20
  },
  unreadTitle: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.text
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5
  },
  notifTime: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 11,
    color: Theme.colors.textLight
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 14
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  emptyTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: Theme.colors.text
  },
  emptyText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22
  }
});
export default NotificationCenterScreen;