import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import { pantryService } from '../services/api';
import { ChevronLeft, Save, Calendar, Package, Tag, Trash2 } from 'lucide-react-native';
import Button from '../components/Button';
import Input from '../components/Input';
const EditItemScreen = ({
  route,
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const {
    item
  } = route.params || {};
  const [name, setName] = useState(item?.name || '');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() || '');
  const [unit, setUnit] = useState(item?.unit || 'pcs');
  const [expiryDate, setExpiryDate] = useState(item?.expiry_date || '');
  const [category, setCategory] = useState(item?.category || 'Produce');
  const [loading, setLoading] = useState(false);
  const handleUpdate = async () => {
    if (!name || !quantity || !expiryDate) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await pantryService.updateItem(item.id, {
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
        expiry_date: expiryDate
      });
      Alert.alert("Success", "Item updated successfully!", [{
        text: "OK",
        onPress: () => navigation.navigate('Pantry')
      }]);
    } catch (error) {
      console.error("Error updating item:", error);
      Alert.alert("Error", "Failed to update item. Please check your data.");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to remove this item?", [{
      text: "Cancel",
      style: "cancel"
    }, {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        await pantryService.deleteItem(item.id);
        navigation.navigate('Pantry');
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={22} color="#000000" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.title}>{t("EditItemScreen.Edit_Item")}</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteHeaderBtn}>
            <Trash2 size={20} color="#000000" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{
        flex: 1
      }}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Input label={t("EditItemScreen.label_Item_Name")} value={name} onChangeText={setName} leftIcon={<Package size={18} color={Theme.colors.textMuted} />} />

              <View style={styles.row}>
                <View style={{
                flex: 1,
                marginRight: 12
              }}>
                  <Input label={t("EditItemScreen.label_Quantity")} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                </View>
                <View style={{
                flex: 1
              }}>
                  <Input label={t("EditItemScreen.label_Unit")} value={unit} onChangeText={setUnit} />
                </View>
              </View>

              <Input label={t("EditItemScreen.label_Expiry_Date")} placeholder={t("EditItemScreen.placeholder_YYYY_MM_DD")} value={expiryDate} onChangeText={setExpiryDate} leftIcon={<Calendar size={18} color={Theme.colors.textMuted} />} />

              <Text style={styles.label}>{t("EditItemScreen.Category")}</Text>
              <View style={styles.categoryGrid}>
                {['Produce', 'Dairy', 'Meat', 'Dry Goods', 'Frozen', 'Snacks', 'Vegetables', 'Fruits', 'Grains'].map(cat => <TouchableOpacity key={cat} style={[styles.categoryChip, category === cat && styles.activeCategoryChip]} onPress={() => setCategory(cat)} activeOpacity={0.8}>
                    <Tag size={13} color={category === cat ? Theme.colors.card : Theme.colors.textMuted} />
                    <Text style={[styles.categoryChipText, category === cat && styles.activeCategoryChipText]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>)}
              </View>

              <View style={styles.footer}>
                <Button title={t("EditItemScreen.title_Save_Changes")} onPress={handleUpdate} loading={loading} size="lg" icon={<Save size={20} color={Theme.colors.white} />} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981', // Solid vibrant green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444', // Solid vibrant red
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#34d399'
  },
  content: {
    padding: 24,
    paddingBottom: 110
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 22,
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  row: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#10b981',
    marginBottom: 8,
    marginTop: 4
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Theme.spacing.lg
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.backgroundMid,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    gap: 6
  },
  activeCategoryChip: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary
  },
  categoryChipText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  },
  activeCategoryChipText: {
    color: Theme.colors.card
  },
  footer: {
    marginTop: 10
  }
});
export default EditItemScreen;