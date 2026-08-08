import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, X, Clock, ChevronRight, Sparkles, ArrowRight } from 'lucide-react-native';
const CATEGORY_DATA = [{
  name: 'Fruits',
  emoji: '🍎',
  color: ['#FFF1F2', '#FECDD3']
}, {
  name: 'Vegetables',
  emoji: '🥦',
  color: ['#ECFDF5', '#D1FAE5']
}, {
  name: 'Dairy',
  emoji: '🥛',
  color: ['#EFF6FF', '#DBEAFE']
}, {
  name: 'Snacks',
  emoji: '🍿',
  color: ['#FFFBEB', '#FEF3C7']
}, {
  name: 'Beverages',
  emoji: '☕',
  color: ['#F5F3FF', '#EDE9FE']
}, {
  name: 'Grains',
  emoji: '🌾',
  color: ['#FEF3C7', '#FDE68A']
}];
const SearchScreen = () => {
  const {
    t
  } = useTranslation();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const recentSearches = ['Avocado', 'Gluten-free pasta', 'Milk', 'Low-carb dinner'];
  const suggestions = [{
    text: 'Avocado Toast Recipe',
    tag: 'Recipe',
    emoji: '🥑'
  }, {
    text: 'Spinach & Feta Omelette',
    tag: 'Recipe',
    emoji: '🍳'
  }, {
    text: 'Banana',
    tag: 'Pantry',
    emoji: '🍌'
  }];
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, Theme.colors.backgroundMid, '#E8FDF3']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("SearchScreen.Search")}</Text>
        <Text style={styles.headerSub}>{t("SearchScreen.Find_items_recipes_categori")}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
          <Search size={20} color={focused ? '#059669' : '#9CA3AF'} strokeWidth={2} />
          <TextInput style={styles.searchInput} placeholder={t("SearchScreen.placeholder_Search_items_recipe")} placeholderTextColor="#9CA3AF" value={query} onChangeText={setQuery} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
          {query !== '' && <TouchableOpacity onPress={() => setQuery('')}>
              <View style={styles.clearBtn}>
                <X size={14} color="#6B7280" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{
      paddingBottom: 40
    }}>
        {/* AI Suggestions Banner */}
        {query === '' && <View style={styles.aiBannerWrapper}>
            <LinearGradient colors={['#059669', '#10B981']} style={styles.aiBanner} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 0
        }}>
              <Sparkles size={18} color="#FFFFFF" strokeWidth={2} />
              <View style={{
            flex: 1
          }}>
                <Text style={styles.aiBannerTitle}>{t("SearchScreen.AI_Powered_Search")}</Text>
                <Text style={styles.aiBannerSub}>{t("SearchScreen.Try_low_carb_dinner_ideas_or")}</Text>
              </View>
              <ArrowRight size={18} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </View>}

        {/* Live Suggestions */}
        {query !== '' && <View style={styles.suggestSection}>
            {suggestions.filter(s => s.text.toLowerCase().includes(query.toLowerCase())).map((s, i) => <TouchableOpacity key={i} style={styles.suggestRow} activeOpacity={0.8}>
                  <View style={styles.suggestEmojiBg}>
                    <Text style={styles.suggestEmoji}>{s.emoji}</Text>
                  </View>
                  <Text style={styles.suggestText}>{s.text}</Text>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagText}>{s.tag}</Text>
                  </View>
                </TouchableOpacity>)}
          </View>}

        {/* Recent Searches */}
        {query === '' && <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t("SearchScreen.Recent_Searches")}</Text>
              <TouchableOpacity>
                <Text style={styles.clearAll}>{t("SearchScreen.Clear_All")}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagRow}>
              {recentSearches.map((item, index) => <TouchableOpacity key={index} style={styles.recentTag} onPress={() => setQuery(item)}>
                  <Clock size={13} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.recentTagText}>{item}</Text>
                </TouchableOpacity>)}
            </View>
          </View>}

        {/* Browse Categories */}
        {query === '' && <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("SearchScreen.Browse_Categories")}</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_DATA.map((cat, index) => <TouchableOpacity key={index} activeOpacity={0.85} style={styles.categoryCardWrapper}>
                  <LinearGradient colors={cat.color} style={styles.categoryCard}>
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <ChevronRight size={14} color="#6B7280" />
                  </LinearGradient>
                </TouchableOpacity>)}
            </View>
          </View>}

        {/* Popular Searches */}
        {query === '' && <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("SearchScreen.Trending")}</Text>
            <View style={styles.trendingList}>
              {['High-protein breakfast', 'Zero-waste dinner', 'Quick 15-min meals', 'Pantry pasta ideas'].map((t, i) => <TouchableOpacity key={i} style={styles.trendingRow} onPress={() => setQuery(t)}>
                  <View style={styles.trendingNum}>
                    <Text style={styles.trendingNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.trendingText}>{t}</Text>
                  <ChevronRight size={16} color="#D1D5DB" />
                </TouchableOpacity>)}
            </View>
          </View>}
      </ScrollView>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text
  },
  headerSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    height: 54,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  searchBarFocused: {
    borderColor: '#10b981'
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff'
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiBannerWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    gap: 12
  },
  aiBannerTitle: {
    color: Theme.colors.card,
    fontSize: 14,
    fontWeight: '700'
  },
  aiBannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2
  },
  suggestSection: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  suggestEmojiBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  suggestEmoji: {
    fontSize: 20
  },
  suggestText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Theme.colors.text
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Theme.colors.backgroundMid,
    borderRadius: 8
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669'
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 14
  },
  clearAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444'
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  recentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.card,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  recentTagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500'
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  categoryCardWrapper: {
    width: '47%'
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    gap: 10
  },
  categoryEmoji: {
    fontSize: 22
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  trendingList: {
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    gap: 14
  },
  trendingNum: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: Theme.colors.backgroundMid,
    justifyContent: 'center',
    alignItems: 'center'
  },
  trendingNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669'
  },
  trendingText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151'
  }
});
export default SearchScreen;