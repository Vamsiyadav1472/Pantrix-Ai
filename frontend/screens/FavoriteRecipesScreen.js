import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { Heart, Star, Clock, ChevronLeft, Sparkles, Flame } from 'lucide-react-native';
const FavoriteRecipesScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const favorites = [{
    id: '1',
    title: 'Avocado Toast',
    rating: 4.9,
    time: '10m',
    calories: 250,
    emoji: '🥑'
  }, {
    id: '2',
    title: 'Salmon Bake',
    rating: 4.7,
    time: '25m',
    calories: 420,
    emoji: '🐟'
  }, {
    id: '3',
    title: 'Berry Smoothie',
    rating: 4.8,
    time: '5m',
    calories: 180,
    emoji: '🫐'
  }];
  const renderFavorite = ({
    item
  }) => <TouchableOpacity style={styles.card} onPress={() => navigation?.navigate('RecipeDetail', {
    recipe: {
      name: item.title,
      id: item.id
    }
  })} activeOpacity={0.88}>
      <View style={styles.emojiContainer}>
        <Text style={{
        fontSize: 28
      }}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingChip}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <View style={styles.metaChip}>
            <Clock size={12} color={Theme.colors.textMuted} />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
          <View style={styles.metaChip}>
            <Flame size={12} color={Theme.colors.danger} />
            <Text style={styles.metaText}>{item.calories}{t("FavoriteRecipesScreen.kcal")}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.heartButton} activeOpacity={0.8}>
        <Heart size={20} color="#EF4444" fill="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>;
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
            <LinearGradient colors={['#FEE2E2', '#FECACA']} style={styles.headerIcon} start={{
            x: 0,
            y: 0
          }} end={{
            x: 1,
            y: 1
          }}>
              <Heart size={22} color="#EF4444" fill="#EF4444" />
            </LinearGradient>
            <View>
              <Text style={styles.screenTitle}>{t("FavoriteRecipesScreen.Favorite_Recipes")}</Text>
              <Text style={styles.subtitle}>{favorites.length}{t("FavoriteRecipesScreen.saved_recipes")}</Text>
            </View>
          </View>
        </View>

        {favorites.length > 0 ? <FlatList data={favorites} renderItem={renderFavorite} keyExtractor={item => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} /> : <View style={styles.empty}>
            <Sparkles size={64} color={Theme.colors.border} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>{t("FavoriteRecipesScreen.No_Favorites_Yet")}</Text>
            <Text style={styles.emptySubtitle}>{t("FavoriteRecipesScreen.Start_hearting_recipes_you_lov")}</Text>
          </View>}
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
  screenTitle: {
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
    gap: 12
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    gap: 14,
    ...Theme.shadows.sm
  },
  emojiContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Theme.colors.backgroundMid,
    justifyContent: 'center',
    alignItems: 'center'
  },
  info: {
    flex: 1
  },
  title: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: Theme.colors.text
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  ratingText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 11,
    color: '#D97706'
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.backgroundMid,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  metaText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 11,
    color: Theme.colors.textMuted
  },
  heartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: Theme.colors.text,
    marginTop: 20,
    marginBottom: 8
  },
  emptySubtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22
  }
});
export default FavoriteRecipesScreen;