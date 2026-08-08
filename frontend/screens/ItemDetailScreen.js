import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { pantryService } from '../services/api';
import { ChevronLeft, Edit2, Trash2, Calendar, Package, Info, ChevronRight, Activity, Sparkles, ShoppingBag } from 'lucide-react-native';
import Button from '../components/Button';
import Card from '../components/Card';
const {
  width
} = Dimensions.get('window');
const ItemDetailScreen = ({
  route,
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const {
    item
  } = route.params || {};
  if (!item) {
    return <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={{
          fontFamily: Theme.typography.fontFamily.bodySemiBold,
          color: Theme.colors.text
        }}>{t("ItemDetailScreen.Item_not_found")}</Text>
          <Button title={t("ItemDetailScreen.title_Go_Back")} onPress={() => navigation.goBack()} style={{
          marginTop: 16
        }} />
        </View>
      </SafeAreaView>;
  }
  const isExpiring = new Date(item.expiry_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const isExpired = new Date(item.expiry_date) < new Date();
  const handleDelete = () => {
    Alert.alert("Delete Item", `Are you sure you want to remove ${item.name} from your pantry?`, [{
      text: "Cancel",
      style: "cancel"
    }, {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          await pantryService.deleteItem(item.id);
          navigation.goBack();
        } catch (error) {
          Alert.alert("Error", "Could not delete item.");
        }
      }
    }]);
  };
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Header */}
          <LinearGradient colors={['#064E3B', '#059669', '#22C55E']} style={styles.headerImage} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtnGreen} onPress={() => navigation.goBack()}>
                <ChevronLeft size={22} color="#000000" strokeWidth={2.5} />
              </TouchableOpacity>
              <View style={styles.rightActions}>
                <TouchableOpacity style={styles.headerBtnGreen} onPress={() => navigation.navigate('EditItem', {
                item
              })}>
                  <Edit2 size={18} color="#000000" strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerBtnRed} onPress={handleDelete}>
                  <Trash2 size={18} color="#000000" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.emojiContainer}>
              <Text style={{
              fontSize: 52
            }}>{item.icon || '🥫'}</Text>
            </View>
          </LinearGradient>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{(item.category || 'Pantry').toUpperCase()}</Text>
              </View>
              {isExpired ? <View style={[styles.statusBadge, {
              backgroundColor: Theme.colors.dangerLight
            }]}>
                  <View style={[styles.statusDot, {
                backgroundColor: Theme.colors.danger
              }]} />
                  <Text style={[styles.statusText, {
                color: Theme.colors.danger
              }]}>{t("ItemDetailScreen.Expired")}</Text>
                </View> : isExpiring ? <View style={[styles.statusBadge, {
              backgroundColor: Theme.colors.warningLight
            }]}>
                  <View style={[styles.statusDot, {
                backgroundColor: Theme.colors.warning
              }]} />
                  <Text style={[styles.statusText, {
                color: '#D97706'
              }]}>{t("ItemDetailScreen.Expiring_Soon")}</Text>
                </View> : <View style={[styles.statusBadge, {
              backgroundColor: Theme.colors.primaryLight
            }]}>
                  <View style={[styles.statusDot, {
                backgroundColor: Theme.colors.primary
              }]} />
                  <Text style={[styles.statusText, {
                color: Theme.colors.primaryDark
              }]}>{t("ItemDetailScreen.Fresh")}</Text>
                </View>}
            </View>

            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Package size={18} color={Theme.colors.primary} />
                <Text style={styles.infoLabel}>{item.quantity} {item.unit}{t("ItemDetailScreen.remaining")}</Text>
              </View>
              <View style={styles.infoItem}>
                <Calendar size={18} color={Theme.colors.accent} />
                <Text style={styles.infoLabel}>
                  {item.expiry_date ? `Expires ${new Date(item.expiry_date).toLocaleDateString()}` : 'No Expiry Set'}
                </Text>
              </View>
            </View>

            {/* Smart Insights */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Sparkles size={18} color={Theme.colors.primary} />
                <Text style={styles.sectionTitle}>{t("ItemDetailScreen.Smart_AI_Insights")}</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>{t("ItemDetailScreen.This_item_is_typically_consume")}</Text>
              </View>
            </View>

            {/* Nutritional Estimate */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Activity size={18} color={Theme.colors.primary} />
                <Text style={styles.sectionTitle}>{t("ItemDetailScreen.Nutritional_Estimate")}</Text>
              </View>
              <View style={styles.nutritionGrid}>
                {[{
                label: 'Calories',
                val: '120 kcal',
                color: '#000000'
              }, {
                label: 'Protein',
                val: '8g',
                color: '#3B82F6'
              }, {
                label: 'Fat',
                val: '4g',
                color: '#EF4444'
              }, {
                label: 'Carbs',
                val: '12g',
                color: '#F59E0B'
              }].map((n, i) => <View key={i} style={styles.nutItem}>
                    <Text style={[styles.nutVal, {
                  color: n.color
                }]}>{n.val}</Text>
                    <Text style={styles.nutLabel}>{n.label}</Text>
                  </View>)}
              </View>
            </View>

            {/* Suggested Recipes */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{t("ItemDetailScreen.Suggested_Recipes")}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Recipes')}>
                  <Text style={styles.seeAll}>{t("ItemDetailScreen.See_All")}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recipesGroup}>
                {['Quick Pasta Bowl', 'Fresh Garden Salad', 'Veggie Stir-fry Delight'].map((r, i) => <TouchableOpacity key={i} style={[styles.recipeLink, i < 2 && styles.recipeLinkBorder]} onPress={() => navigation.navigate('Recipes')} activeOpacity={0.8}>
                    <Text style={styles.recipeLinkText}>🍳  {r}</Text>
                    <ChevronRight size={18} color={Theme.colors.textLight} />
                  </TouchableOpacity>)}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.shoppingBtn} onPress={() => navigation.navigate('Grocery')} activeOpacity={0.88}>
            <ShoppingBag size={18} color="#000000" />
            <Text style={styles.shoppingBtnText}>{t("ItemDetailScreen.Add_to_Grocery_List")}</Text>
          </TouchableOpacity>
        </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  content: {
    paddingBottom: 110
  },
  headerImage: {
    height: 220,
    paddingTop: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    ...Theme.shadows.md
  },
  headerActions: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10
  },
  rightActions: {
    flexDirection: 'row',
    gap: 10
  },
  headerBtnGreen: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerBtnRed: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
    marginTop: 20
  },
  detailsContainer: {
    padding: 24
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  categoryBadge: {
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12
  },
  categoryText: {
    fontSize: 10,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.primaryDark,
    letterSpacing: 1
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  statusText: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  name: {
    fontSize: 30,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.text,
    marginBottom: 16,
    letterSpacing: -0.5
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    ...Theme.shadows.xs,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    flex: 1
  },
  infoLabel: {
    fontSize: 13,
    color: '#000000',
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.text
  },
  insightCard: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)'
  },
  insightText: {
    fontSize: 14,
    color: '#065F46',
    fontFamily: Theme.typography.fontFamily.body,
    lineHeight: 22
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderRadius: 20,
    ...Theme.shadows.xs,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  nutItem: {
    alignItems: 'center'
  },
  nutVal: {
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.heading
  },
  nutLabel: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    textTransform: 'uppercase'
  },
  seeAll: {
    color: Theme.colors.primary,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 13
  },
  recipesGroup: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    ...Theme.shadows.xs,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  recipeLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  recipeLinkBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight
  },
  recipeLinkText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight
  },
  shoppingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: '#10b981', // Vibrant green
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shoppingBtnText: {
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#000000'
  }
});
export default ItemDetailScreen;