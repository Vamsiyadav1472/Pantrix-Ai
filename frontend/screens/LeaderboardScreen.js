import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Award, Zap, ChevronRight, Crown } from 'lucide-react-native';
import { Theme } from '../theme';
const {
  width
} = Dimensions.get('window');
const LeaderboardScreen = () => {
  const {
    t
  } = useTranslation();
  const players = [{
    rank: 1,
    name: 'EcoWarrior',
    points: 4500,
    badge: '🥇',
    color: '#F59E0B',
    isTop: true
  }, {
    rank: 2,
    name: 'Alex J.',
    points: 4200,
    badge: '🥈',
    color: '#9CA3AF',
    isUser: true
  }, {
    rank: 3,
    name: 'PantryPro',
    points: 3900,
    badge: '🥉',
    color: '#CD7F32'
  }, {
    rank: 4,
    name: 'ZeroWasteKing',
    points: 3500,
    badge: '4',
    color: '#6B7280'
  }, {
    rank: 5,
    name: 'SustainableSara',
    points: 3200,
    badge: '5',
    color: '#6B7280'
  }, {
    rank: 6,
    name: 'GreenChef99',
    points: 2900,
    badge: '6',
    color: '#6B7280'
  }, {
    rank: 7,
    name: 'FrugalFoodie',
    points: 2600,
    badge: '7',
    color: '#6B7280'
  }];
  const topThree = players.slice(0, 3);
  const rest = players.slice(3);
  const renderItem = ({
    item
  }) => <TouchableOpacity style={[styles.row, item.isUser && styles.userRow]} activeOpacity={0.8}>
      {item.isUser && <LinearGradient colors={['#059669', '#10B981']} style={StyleSheet.absoluteFill} borderRadius={16} />}
      <View style={[styles.rankBadge, item.isUser && styles.rankBadgeUser]}>
        <Text style={[styles.rankText, item.isUser && {
        color: Theme.colors.card
      }]}>{item.badge}</Text>
      </View>
      <View style={[styles.avatar, item.isUser && styles.avatarUser]}>
        <Text style={styles.avatarText}>{item.name[0]}</Text>
      </View>
      <Text style={[styles.playerName, item.isUser && styles.playerNameUser]}>{item.name}</Text>
      <View style={styles.pointsRow}>
        {item.isUser && <Zap size={13} color="#FDE68A" strokeWidth={2} />}
        <Text style={[styles.points, item.isUser && styles.pointsUser]}>{item.points.toLocaleString()}{t("LeaderboardScreen.pts")}</Text>
      </View>
    </TouchableOpacity>;
  return <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#059669', '#047857']} style={styles.header} start={{
      x: 0,
      y: 0
    }} end={{
      x: 1,
      y: 1
    }}>
        <View style={styles.headerContent}>
          <Crown size={28} color="#FDE68A" strokeWidth={2} />
          <Text style={styles.headerTitle}>{t("LeaderboardScreen.Leaderboard")}</Text>
          <Text style={styles.headerSub}>{t("LeaderboardScreen.Top_Zero_Waste_Heroes")}</Text>
        </View>

        {/* User Stat Badges */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{t("LeaderboardScreen.2nd")}</Text>
            <Text style={styles.statLab}>{t("LeaderboardScreen.Global_Rank")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>4,200</Text>
            <Text style={styles.statLab}>{t("LeaderboardScreen.Your_Points")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>+150</Text>
            <Text style={styles.statLab}>{t("LeaderboardScreen.This_Week")}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Podium for top 3 */}
      <View style={styles.podiumWrapper}>
        {/* 2nd place */}
        <View style={styles.podiumItem}>
          <View style={[styles.podiumAvatar, {
          borderColor: '#9CA3AF'
        }]}>
            <Text style={styles.podiumAvatarText}>{topThree[1].name[0]}</Text>
          </View>
          <Text style={styles.podiumName}>{topThree[1].name}</Text>
          <View style={[styles.podiumPillar, {
          height: 60,
          backgroundColor: '#E5E7EB'
        }]}>
            <Text style={styles.podiumRank}>🥈</Text>
          </View>
        </View>

        {/* 1st place - center, tallest */}
        <View style={[styles.podiumItem, {
        marginBottom: -12
      }]}>
          <Crown size={20} color="#F59E0B" style={{
          marginBottom: 4
        }} />
          <View style={[styles.podiumAvatar, {
          borderColor: '#F59E0B',
          width: 60,
          height: 60,
          borderRadius: 30
        }]}>
            <Text style={[styles.podiumAvatarText, {
            fontSize: 24
          }]}>{topThree[0].name[0]}</Text>
          </View>
          <Text style={styles.podiumName}>{topThree[0].name}</Text>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={[styles.podiumPillar, {
          height: 90
        }]}>
            <Text style={styles.podiumRank}>🥇</Text>
          </LinearGradient>
        </View>

        {/* 3rd place */}
        <View style={styles.podiumItem}>
          <View style={[styles.podiumAvatar, {
          borderColor: '#CD7F32'
        }]}>
            <Text style={styles.podiumAvatarText}>{topThree[2].name[0]}</Text>
          </View>
          <Text style={styles.podiumName}>{topThree[2].name}</Text>
          <View style={[styles.podiumPillar, {
          height: 44,
          backgroundColor: '#FDE68A'
        }]}>
            <Text style={styles.podiumRank}>🥉</Text>
          </View>
        </View>
      </View>

      {/* Rest of the list */}
      <FlatList data={rest} renderItem={renderItem} keyExtractor={item => item.rank.toString()} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme.colors.card,
    marginTop: 8
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 20,
    padding: 16
  },
  statCard: {
    alignItems: 'center'
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.card
  },
  statLab: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2
  },
  podiumWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: Theme.colors.card,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4
  },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.backgroundMid,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  podiumAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669'
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center'
  },
  podiumPillar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8
  },
  podiumRank: {
    fontSize: 20
  },
  list: {
    padding: 16,
    gap: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  userRow: {
    overflow: 'hidden'
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rankBadgeUser: {
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280'
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Theme.colors.backgroundMid,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarUser: {
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669'
  },
  playerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text
  },
  playerNameUser: {
    color: Theme.colors.card
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  points: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669'
  },
  pointsUser: {
    color: Theme.colors.card
  }
});
export default LeaderboardScreen;