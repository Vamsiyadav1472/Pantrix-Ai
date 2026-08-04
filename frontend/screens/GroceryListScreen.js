import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Trash2, ShoppingCart, Save, RefreshCw, ShoppingBag, CheckCircle2, Tag, IndianRupee } from 'lucide-react-native';
import { Theme } from '../theme';
import { groceryService } from '../services/api';
const {
  width
} = Dimensions.get('window');
const GroceryListScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [userId, setUserId] = useState(1);
  const [listName, setListName] = useState('My Grocery List');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [items, setItems] = useState([]);
  const [savedLists, setSavedLists] = useState([]);
  const [loading, setLoading] = useState(false);
  useFocusEffect(useCallback(() => {
    loadUserAndLists();
  }, []));
  const loadUserAndLists = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      let id = 1;
      if (userData) {
        const parsed = JSON.parse(userData);
        id = parsed.user_id || parsed.id || 1;
        setUserId(id);
      }
      await fetchGroceryLists(id);
    } catch (error) {
      console.log('Error loading grocery data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleRefresh = () => {
    setListName('My Grocery List');
    setItemName('');
    setQuantity('1');
    setPrice('');
    setItems([]);
    loadUserAndLists();
  };
  const fetchGroceryLists = async id => {
    try {
      const response = await groceryService.getLists(id);
      const data = response?.data || [];
      setSavedLists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Error fetching grocery lists:', error);
    }
  };
  const calculateTotal = (listItems = items) => {
    return listItems.reduce((sum, item) => {
      const itemPrice = Number(item.price || 0);
      const itemQuantity = Number(item.quantity || 1);
      return sum + itemPrice * itemQuantity;
    }, 0);
  };
  const addItem = () => {
    if (!itemName.trim()) {
      Alert.alert('Missing Item', 'Please enter item name.');
      return;
    }
    const newItem = {
      item_name: itemName.trim(),
      quantity: Number(quantity || 1),
      price: Number(price || 0)
    };
    setItems([...items, newItem]);
    setItemName('');
    setQuantity('1');
    setPrice('');
  };
  const removeItem = index => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };
  const saveGroceryList = async () => {
    if (!listName.trim()) {
      Alert.alert('Missing Name', 'Please enter grocery list name.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('No Items', 'Please add at least one item.');
      return;
    }
    try {
      setLoading(true);
      const groceryData = {
        name: listName.trim(),
        items: items,
        total_price: calculateTotal(items)
      };
      await groceryService.createList(userId, groceryData);
      Alert.alert('Success', 'Grocery list saved successfully.');
      setListName('My Grocery List');
      setItems([]);
      await fetchGroceryLists(userId);
    } catch (error) {
      console.log('Error saving grocery list:', error);
      Alert.alert('Save Error', error.response?.data?.detail || 'Failed to save grocery list.');
    } finally {
      setLoading(false);
    }
  };
  const deleteGroceryList = async listId => {
    Alert.alert('Delete Grocery Item', 'Are you sure you want to remove this item from your grocery list?', [{
      text: 'Cancel',
      style: 'cancel'
    }, {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          setLoading(true);
          await groceryService.deleteItem(listId);

          // Immediately update the UI after successful deletion
          setSavedLists(prevLists => prevLists.filter(list => (list.id || list.grocery_id) !== listId));

          // Refresh list in background to ensure sync
          fetchGroceryLists(userId);
        } catch (error) {
          console.log('Error deleting grocery item:', error);
          if (error.message === 'Network Error' || !error.response) {
            Alert.alert('Offline', 'Cannot delete item while offline. Please check your internet connection.');
          } else {
            Alert.alert('Error', 'Failed to delete grocery item.');
          }
        } finally {
          setLoading(false);
        }
      }
    }]);
  };
  const renderSavedItems = savedItems => {
    let parsedItems = [];
    try {
      if (typeof savedItems === 'string') {
        parsedItems = JSON.parse(savedItems);
      } else if (Array.isArray(savedItems)) {
        parsedItems = savedItems;
      }
    } catch (error) {
      parsedItems = [];
    }
    if (!parsedItems.length) {
      return <Text style={styles.savedSubText}>{t("GroceryListScreen.No_items")}</Text>;
    }
    return parsedItems.map((item, index) => <View key={index} style={styles.savedItemRow}>
        <View style={styles.savedItemDot} />
        <Text style={styles.savedSubText}>
          {item.item_name || item.name} × {item.quantity || 1}
        </Text>
        <Text style={styles.savedPriceTag}>₹{item.price || 0}</Text>
      </View>);
  };
  if (loading && savedLists.length === 0) {
    return <SafeAreaView style={styles.container}>
        <LinearGradient colors={Theme.gradients.background} style={styles.center}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </LinearGradient>
      </SafeAreaView>;
  }
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{t("GroceryListScreen.Grocery_List")}</Text>
              <Text style={styles.subtitle}>{t("GroceryListScreen.Plan_and_organize_your_shoppin")}</Text>
            </View>

            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} activeOpacity={0.8}>
              <View style={[styles.refreshGrad, { backgroundColor: Theme.colors.primary }]}>
                <RefreshCw size={20} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Add Item Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <ShoppingBag size={18} color={Theme.colors.primary} />
              <Text style={styles.cardHeaderTitle}>{t("GroceryListScreen.Create_New_List")}</Text>
            </View>

            <Text style={styles.label}>{t("GroceryListScreen.List_Name")}</Text>
            <TextInput value={listName} onChangeText={setListName} placeholder={t("GroceryListScreen.placeholder_Example_Weekly_Groc")} placeholderTextColor={Theme.colors.textPlaceholder} style={styles.input} />

            <Text style={styles.label}>{t("GroceryListScreen.Item_Name")}</Text>
            <TextInput value={itemName} onChangeText={setItemName} placeholder={t("GroceryListScreen.placeholder_Example_Milk")} placeholderTextColor={Theme.colors.textPlaceholder} style={styles.input} />

            <View style={styles.row}>
              <View style={styles.halfInputBox}>
                <Text style={styles.label}>{t("GroceryListScreen.Quantity")}</Text>
                <TextInput value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="1" placeholderTextColor={Theme.colors.textPlaceholder} style={styles.input} />
              </View>

              <View style={styles.halfInputBox}>
                <Text style={styles.label}>{t("GroceryListScreen.Price")}</Text>
                <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0" placeholderTextColor={Theme.colors.textPlaceholder} style={styles.input} />
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addItem} activeOpacity={0.88}>
              <LinearGradient colors={Theme.gradients.primary} style={styles.buttonGrad} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 0
            }}>
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.addButtonText}>{t("GroceryListScreen.Add_Item")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Current Items Draft */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <CheckCircle2 size={18} color={Theme.colors.primary} />
              <Text style={styles.cardHeaderTitle}>{t("GroceryListScreen.Current_Draft_Items")}{items.length})</Text>
            </View>

            {items.length === 0 ? <View style={styles.emptyDraft}>
                <Text style={styles.emptyDraftEmoji}>🧺</Text>
                <Text style={styles.emptyText}>{t("GroceryListScreen.No_items_added_to_current_list")}</Text>
              </View> : items.map((item, index) => <View key={index} style={styles.itemRow}>
                  <View style={{
              flex: 1
            }}>
                    <Text style={styles.itemName}>{item.item_name}</Text>
                    <Text style={styles.itemDetails}>{t("GroceryListScreen.Qty")}{item.quantity}{t("GroceryListScreen._Price")}{item.price}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.deleteItemBtn} onPress={() => removeItem(index)}>
                    <Trash2 size={16} color={Theme.colors.danger} />
                  </TouchableOpacity>
                </View>)}

            <View style={styles.totalBox}>
              <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6
            }}>
                <IndianRupee size={18} color="#065F46" />
                <Text style={styles.totalLabel}>{t("GroceryListScreen.Estimated_Total")}</Text>
              </View>
              <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
            </View>

            <TouchableOpacity style={[styles.saveButton, loading && {
            opacity: 0.7
          }]} onPress={saveGroceryList} disabled={loading} activeOpacity={0.88}>
              <LinearGradient colors={['#059669', '#10B981']} style={styles.buttonGrad} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 0
            }}>
                <Save size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Grocery List'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Saved Grocery Lists */}
          <Text style={styles.savedTitle}>{t("GroceryListScreen.Saved_Grocery_Lists")}</Text>

          {savedLists.length === 0 ? <View style={styles.emptySaved}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                <ShoppingCart size={40} color="#000000" />
              </View>
              <Text style={styles.emptyTitle}>{t("GroceryListScreen.No_Saved_Lists")}</Text>
              <Text style={styles.emptyText}>{t("GroceryListScreen.Create_and_save_your_grocery_l")}</Text>
            </View> : savedLists.map((list, index) => <View key={list.id || index} style={styles.savedCard}>
                <View style={styles.savedHeader}>
                  <View style={{
              flex: 1
            }}>
                    <Text style={styles.savedName}>
                      {list.name || 'My Grocery List'}
                    </Text>
                    <View style={styles.savedItemsContainer}>
                      {renderSavedItems(list.items)}
                    </View>
                  </View>

                  <TouchableOpacity style={styles.deleteListBtn} onPress={() => deleteGroceryList(list.id || list.grocery_id)}>
                    <Trash2 size={16} color={Theme.colors.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.savedFooter}>
                  <Text style={styles.savedTotalLabel}>{t("GroceryListScreen.Total_Amount")}</Text>
                  <Text style={styles.savedTotalValue}>₹{list.total_price || 0}</Text>
                </View>
              </View>)}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>;
};
export default GroceryListScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  gradient: {
    flex: 1
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    padding: 24,
    paddingBottom: 110
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
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
  refreshButton: {
    borderRadius: 22,
    overflow: 'hidden',
    ...Theme.shadows.sm
  },
  refreshGrad: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  cardHeaderTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 17,
    color: Theme.colors.primary
  },
  label: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 13,
    color: Theme.colors.primary,
    marginBottom: 6
  },
  input: {
    backgroundColor: Theme.colors.backgroundMid,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
    color: Theme.colors.text,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfInputBox: {
    flex: 1
  },
  addButton: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    marginTop: 4,
    ...Theme.shadows.sm
  },
  buttonGrad: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderRadius: Theme.borderRadius.xl
  },
  addButtonText: {
    color: Theme.colors.card,
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  emptyDraft: {
    alignItems: 'center',
    paddingVertical: 16
  },
  emptyDraftEmoji: {
    fontSize: 32,
    marginBottom: 6
  },
  emptyText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.body,
    textAlign: 'center'
  },
  itemRow: {
    backgroundColor: Theme.colors.backgroundMid,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemName: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.text
  },
  itemDetails: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.body,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  deleteItemBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  totalBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)'
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#065F46'
  },
  totalValue: {
    fontSize: 20,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#059669'
  },
  saveButton: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    ...Theme.shadows.sm
  },
  saveButtonText: {
    color: Theme.colors.card,
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  savedTitle: {
    fontSize: 22,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.primary,
    marginTop: 10,
    marginBottom: 14
  },
  emptySaved: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    ...Theme.shadows.xs
  },
  emptyTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 17,
    color: Theme.colors.primary
  },
  savedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  savedName: {
    fontSize: 17,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.primary,
    marginBottom: 10
  },
  savedItemsContainer: {
    gap: 6
  },
  savedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  savedItemDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Theme.colors.primary
  },
  savedSubText: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.body,
    color: Theme.colors.primary,
    flex: 1
  },
  savedPriceTag: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.primary
  },
  deleteListBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  savedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight
  },
  savedTotalLabel: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.primary
  },
  savedTotalValue: {
    fontSize: 17,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.primary
  }
});