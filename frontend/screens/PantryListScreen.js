import { useTranslation } from "react-i18next";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, RefreshControl, Alert, TextInput, ScrollView, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pantryService } from '../services/api';
import { Theme } from '../theme';
import { Search, Plus, Package, Calendar, Trash2, Edit2, ChevronRight } from 'lucide-react-native';
const {
  width
} = Dimensions.get('window');
const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Meat', 'Beverages', 'Other'];
const CATEGORY_IMAGES = {
  All: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&q=80',
  Vegetables: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=150&q=80',
  Fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=150&q=80',
  Dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=150&q=80',
  Grains: 'https://images.unsplash.com/photo-1574316071802-0d684efa7ea5?w=150&q=80',
  Meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bd682f?w=150&q=80',
  Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=150&q=80',
  Other: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=150&q=80'
};
const CATEGORY_EMOJIS = {
  All: '🧺',
  Vegetables: '🥦',
  Fruits: '🍎',
  Dairy: '🥛',
  Grains: '🌾',
  Meat: '🥩',
  Beverages: '🧃',
  Other: '📦'
};
const getExpiryStatus = expiryDate => {
  if (!expiryDate) return {
    label: 'No Expiry',
    color: Theme.colors.textMuted,
    bg: Theme.colors.backgroundMid,
    dot: Theme.colors.textLight
  };
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffMs = exp - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffMs < 0) return {
    label: 'Expired',
    color: '#DC2626',
    bg: '#FEE2E2',
    dot: '#EF4444'
  };
  if (diffDays <= 3) return {
    label: 'Expiring Soon',
    color: '#D97706',
    bg: '#FEF3C7',
    dot: '#F59E0B'
  };
  if (diffDays <= 7) return {
    label: 'Use Soon',
    color: '#D97706',
    bg: '#FFFBEB',
    dot: '#FBBF24'
  };
  return {
    label: 'Fresh',
    color: '#15803D',
    bg: '#DCFCE7',
    dot: '#22C55E'
  };
};
const getDaysRemaining = expiryDate => {
  if (!expiryDate) return null;
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffMs = exp - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day left';
  return `${diffDays} days left`;
};

// Skeleton row
const SkeletonRow = () => {
  const {
    t
  } = useTranslation();
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(shimmer, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }), Animated.timing(shimmer, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true
    })])).start();
  }, []);
  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1]
  });
  return <Animated.View style={[styles.skeletonCard, {
    opacity
  }]}>
      <View style={styles.skeletonIcon} />
      <View style={{
      flex: 1,
      gap: 8
    }}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, {
        width: '60%'
      }]} />
        <View style={[styles.skeletonLine, {
        width: '40%',
        height: 20,
        borderRadius: 10
      }]} />
      </View>
    </Animated.View>;
};
const PantryListScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [userId, setUserId] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.user_id || 1);
        }
      } catch (e) {}
    };
    getUser();
  }, []);
  const fetchItems = async () => {
    try {
      const response = await pantryService.getAll(userId);
      setItems(response.data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start();
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert('Error', 'Failed to fetch pantry items.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useFocusEffect(useCallback(() => {
    setLoading(true);
    fadeAnim.setValue(0);
    fetchItems();
  }, [userId]));
  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };
  const handleDelete = item => {
    Alert.alert('Delete Item', `Remove "${item.name}" from your pantry?`, [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        setDeletingId(item.id);
        try {
          await pantryService.deleteItem(item.id);
          setItems(prev => prev.filter(i => i.id !== item.id));
        } catch (error) {
          console.error('Delete error:', error);
          Alert.alert('Error', 'Could not delete item. Please try again.');
        } finally {
          setDeletingId(null);
        }
      }
    }]);
  };
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category && item.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });
  const renderItem = ({
    item,
    index
  }) => {
    const status = getExpiryStatus(item.expiry_date);
    const daysLeft = getDaysRemaining(item.expiry_date);
    const isDeleting = deletingId === item.id;
    return <Animated.View style={{
      opacity: fadeAnim
    }}>
        <TouchableOpacity style={styles.itemCard} onPress={() => navigation.navigate('ItemDetail', {
        item
      })} activeOpacity={0.88}>
          {/* Left accent bar */}
          <View style={[styles.accentBar, {
          backgroundColor: status.dot
        }]} />

          {/* Icon area */}
          <View style={[styles.iconContainer, {
          backgroundColor: status.bg
        }]}>
            <Text style={styles.iconEmoji}>{item.icon || '🥫'}</Text>
          </View>

          {/* Info */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Package size={12} color="#FFFFFF" />
                <Text style={styles.metaText}>{item.quantity} {item.unit}</Text>
              </View>
              {item.category && <Text style={styles.categoryTag}>{item.category}</Text>}
            </View>

            <View style={styles.bottomRow}>
              <View style={[styles.freshnessBadge, {
              backgroundColor: status.bg
            }]}>
                <View style={[styles.freshnessDot, {
                backgroundColor: status.dot
              }]} />
                <Text style={[styles.freshnessLabel, {
                color: status.color
              }]}>{status.label}</Text>
              </View>
              {daysLeft && <Text style={[styles.daysLeft, {
              color: status.dot
            }]}>{daysLeft}</Text>}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditItem', {
            item
          })} hitSlop={{
            top: 8,
            bottom: 8,
            left: 8,
            right: 8
          }}>
              <Edit2 size={16} color={Theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} disabled={isDeleting} hitSlop={{
            top: 8,
            bottom: 8,
            left: 8,
            right: 8
          }}>
              <Trash2 size={16} color={Theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>;
  };
  return <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t("PantryListScreen.My_Pantry")}</Text>
            <Text style={styles.subtitle}>{items.length}{t("PantryListScreen.items_stored")}</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color="#FFFFFF" />
            <TextInput style={styles.searchInput} placeholder={t("PantryListScreen.placeholder_Search_pantry_items")} placeholderTextColor="#FFFFFF" value={search} onChangeText={setSearch} />
            {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}>
                <View style={styles.clearSearch}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </View>
              </TouchableOpacity>}
          </View>
        </View>

        {/* Category filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll} style={styles.categoriesContainer}>
          {CATEGORIES.map(cat => <TouchableOpacity key={cat} style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]} onPress={() => setActiveCategory(cat)} activeOpacity={0.8}>
              {activeCategory === cat ? <View style={[styles.chipInner, { borderColor: Theme.colors.primary, borderWidth: 2 }]}>
                  <Text style={styles.chipEmojiActive}>{CATEGORY_EMOJIS[cat]}</Text>
                  <Text style={styles.categoryTextActive}>{cat}</Text>
                </View> : <View style={styles.chipInner}>
                  <Text style={styles.chipEmoji}>{CATEGORY_EMOJIS[cat]}</Text>
                  <Text style={styles.categoryText}>{cat}</Text>
                </View>}
            </TouchableOpacity>)}
        </ScrollView>

        {/* List */}
        {loading && !refreshing ? <View style={styles.skeletonList}>
            {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
          </View> : <FlatList data={filteredItems} renderItem={renderItem} keyExtractor={item => item.id.toString()} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />} ListEmptyComponent={<View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                  {search ? 'No results found' : 'Your pantry is empty'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {search ? `No items matching "${search}"` : 'Start by adding your first pantry item'}
                </Text>
                {!search && <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('QuickAddItem')}>
                    <LinearGradient colors={Theme.gradients.primary} style={styles.emptyBtnGrad} start={{
            x: 0,
            y: 0
          }} end={{
            x: 1,
            y: 0
          }}>
                      <Plus size={18} color="#FFFFFF" />
                      <Text style={styles.emptyBtnText}>{t("PantryListScreen.Add_First_Item")}</Text>
                    </LinearGradient>
                  </TouchableOpacity>}
              </View>} />}

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('QuickAddItem')} activeOpacity={0.88}>
          <LinearGradient colors={Theme.gradients.primary} style={styles.fabGrad} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }}>
            <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  gradient: {
    flex: 1
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 30,
    color: Theme.colors.text,
    letterSpacing: -0.5
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  headerBtn: {
    borderRadius: 22,
    overflow: 'hidden',
    ...Theme.shadows.md
  },
  headerBtnGrad: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Search
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 14
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadows.xs
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#FFFFFF'
  },
  clearSearch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearSearchText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  // Categories
  categoriesContainer: {
    marginBottom: 14,
    maxHeight: 50, // Added to prevent stretching
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 8,
    alignItems: 'center' // Added to prevent stretching
  },
  categoryChip: {
    height: 40, // Added to prevent stretching
    borderRadius: Theme.borderRadius.pill,
    overflow: 'hidden',
    ...Theme.shadows.xs
  },
  categoryChipActive: {
    ...Theme.shadows.sm
  },
  chipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
    borderRadius: Theme.borderRadius.pill
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  chipEmoji: {
    fontSize: 14
  },
  chipEmojiActive: {
    fontSize: 14
  },
  categoryText: {
    fontSize: 13,
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  categoryTextActive: {
    fontSize: 13,
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  // List
  list: {
    paddingHorizontal: 24,
    paddingBottom: 110,
    gap: 12
  },
  // Item Card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: 20,
    overflow: 'hidden',
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch'
  },
  iconContainer: {
    width: 54,
    height: 54,
    margin: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconEmoji: {
    fontSize: 26
  },
  itemInfo: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 8,
    gap: 5
  },
  itemName: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: '#FFFFFF'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  metaText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)'
  },
  categoryTag: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Theme.typography.fontFamily.body
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2
  },
  freshnessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5
  },
  freshnessDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  freshnessLabel: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  daysLeft: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingRight: 14,
    paddingVertical: 14
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Skeleton
  skeletonList: {
    paddingHorizontal: 24,
    gap: 12
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    ...Theme.shadows.xs
  },
  skeletonIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Theme.colors.border
  },
  skeletonLine: {
    height: 14,
    backgroundColor: Theme.colors.border,
    borderRadius: 7,
    width: '80%'
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    borderRadius: 30,
    overflow: 'hidden',
    ...Theme.shadows.lg
  },
  fabGrad: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12
  },
  emptyEmoji: {
    display: 'none'
  },
  emptyTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: Theme.colors.text,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22
  },
  emptyBtn: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    marginTop: 8,
    ...Theme.shadows.md
  },
  emptyBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.xl
  },
  emptyBtnText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: Theme.colors.card
  }
});
export default PantryListScreen;