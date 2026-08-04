import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { Heart, Bookmark, Users, ChevronLeft, Plus, Sparkles } from 'lucide-react-native';
const CommunityRecipesScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [savedPosts, setSavedPosts] = useState({});
  const posts = [{
    id: '1',
    user: 'ChefMaria',
    title: "Grandma's Lasagna",
    likes: 1240,
    emoji: '🍝',
    category: 'Italian'
  }, {
    id: '2',
    user: 'HealthyTom',
    title: 'Zucchini Noodles',
    likes: 850,
    emoji: '🥗',
    category: 'Keto'
  }, {
    id: '3',
    user: 'QuickEats',
    title: '5-Min Smoothie Bowl',
    likes: 2100,
    emoji: '🫐',
    category: 'Breakfast'
  }];
  const toggleBookmark = id => {
    setSavedPosts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const renderPost = ({
    item
  }) => <View style={styles.card}>
      <View style={styles.userRow}>
        <LinearGradient colors={Theme.gradients.primary} style={styles.miniAvatar}>
          <Text style={styles.avatarText}>{item.user[0]}</Text>
        </LinearGradient>
        <View style={{
        flex: 1
      }}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.categoryBadge}>{item.category}</Text>
        </View>
      </View>

      <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.imageBox} start={{
      x: 0,
      y: 0
    }} end={{
      x: 1,
      y: 1
    }}>
        <Text style={{
        fontSize: 54
      }}>{item.emoji}</Text>
      </LinearGradient>

      <View style={styles.infoRow}>
        <View style={{
        flex: 1
      }}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <View style={styles.likesRow}>
            <Heart size={14} color="#EF4444" fill="#EF4444" />
            <Text style={styles.likes}>{item.likes}{t("CommunityRecipesScreen.likes")}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={() => toggleBookmark(item.id)} activeOpacity={0.8}>
          <Bookmark size={20} color={savedPosts[item.id] ? Theme.colors.primary : Theme.colors.textLight} fill={savedPosts[item.id] ? Theme.colors.primary : 'none'} />
        </TouchableOpacity>
      </View>
    </View>;
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
              <ChevronLeft size={22} color={Theme.colors.text} />
            </TouchableOpacity>}
          <View style={styles.headerCenter}>
            <LinearGradient colors={['#DBEAFE', '#BFDBFE']} style={styles.headerIcon} start={{
            x: 0,
            y: 0
          }} end={{
            x: 1,
            y: 1
          }}>
              <Users size={22} color="#2563EB" />
            </LinearGradient>
            <View>
              <Text style={styles.title}>{t("CommunityRecipesScreen.Community")}</Text>
              <Text style={styles.subtitle}>{t("CommunityRecipesScreen.Discover_share_home_recipes")}</Text>
            </View>
          </View>
        </View>

        <FlatList data={posts} renderItem={renderPost} keyExtractor={item => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.88}>
          <LinearGradient colors={Theme.gradients.primary} style={styles.fabGrad}>
            <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
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
    gap: 14
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xs
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.sm
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 22,
    color: Theme.colors.text,
    letterSpacing: -0.3
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 110,
    gap: 16
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadows.sm
  },
  userRow: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
    gap: 12
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 14,
    color: Theme.colors.card
  },
  userName: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 15,
    color: Theme.colors.text
  },
  categoryBadge: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 11,
    color: Theme.colors.textMuted
  },
  imageBox: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoRow: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  postTitle: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 17,
    color: Theme.colors.text
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  likes: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.backgroundMid,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    borderRadius: 30,
    overflow: 'hidden',
    ...Theme.shadows.lg
  },
  fabGrad: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
export default CommunityRecipesScreen;