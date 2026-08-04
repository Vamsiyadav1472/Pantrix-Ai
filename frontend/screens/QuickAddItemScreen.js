import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme';
import { ArrowLeft, Package, Calendar, Clock, Scale, Plus, Tag } from 'lucide-react-native';
import { pantryService } from '../services/api';
const QuickAddItemScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [category, setCategory] = useState('Others');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(1);
  const UNIT_OPTIONS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'dozen', 'box'];
  const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Others'];
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
  const autoClassifyCategory = name => {
    const n = name.toLowerCase();
    if (['tomato', 'spinach', 'onion'].some(i => n.includes(i))) return 'Vegetables';
    if (['apple', 'banana', 'mango'].some(i => n.includes(i))) return 'Fruits';
    if (['milk', 'egg', 'cheese', 'curd', 'eggs'].some(i => n.includes(i))) return 'Dairy';
    if (['rice', 'wheat', 'oats', 'bread'].some(i => n.includes(i))) return 'Grains';
    return 'Others';
  };
  const handleNameChange = t => {
    setItemName(t);
    setErrors(p => ({
      ...p,
      itemName: null
    }));
    if (t.trim().length > 2) {
      setCategory(autoClassifyCategory(t));
    }
  };
  const validate = () => {
    const newErrors = {};
    if (!itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) newErrors.quantity = 'Enter a valid quantity';
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Use format YYYY-MM-DD';
    }
    if (!expiryTime) {
      newErrors.expiryTime = 'Expiry Time is required';
    } else if (!/^\d{2}-\d{2}$/.test(expiryTime)) {
      newErrors.expiryTime = 'Use format HH-MM';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const getExpiryDateTime = () => {
    if (!expiryDate) return null;
    if (expiryTime) {
      return `${expiryDate}T${expiryTime.replace('-', ':')}:00`;
    }
    return `${expiryDate}T00:00:00`;
  };
  const handleAddItem = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: itemName.trim(),
        category: category,
        quantity: parseFloat(quantity),
        unit: unit,
        expiry_date: getExpiryDateTime()
      };
      await pantryService.addItem(userId, payload);
      Alert.alert('✅ Item Added', `"${itemName.trim()}" has been added to your pantry!`, [{
        text: 'Add Another',
        onPress: () => {
          setItemName('');
          setQuantity('1');
          setUnit('pcs');
          setExpiryDate('');
          setExpiryTime('');
          setCategory('Others');
          setErrors({});
        }
      }, {
        text: 'View Pantry',
        onPress: () => navigation.navigate('Main', {
          screen: 'Pantry'
        }),
        style: 'default'
      }, {
        text: 'Go to Dashboard',
        onPress: () => navigation.navigate('Main', {
          screen: 'Dashboard'
        })
      }]);
    } catch (error) {
      console.error('Add item error:', error?.response?.data || error.message);
      const msg = error?.response?.data?.detail || error.message || 'Unknown error';
      Alert.alert('Error Adding Item', `${msg}\n\nCheck your network and try again.`);
    } finally {
      setLoading(false);
    }
  };
  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={Theme.gradients.background} style={styles.gradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 0,
      y: 1
    }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("QuickAddItemScreen.Add_Pantry_Item")}</Text>
          <View style={{
          width: 40
        }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* Item Name */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Package size={16} color={Theme.colors.primary} strokeWidth={2} />
                <Text style={[styles.label, { color: Theme.colors.primary }]}>{t("QuickAddItemScreen.Item_Name")}<Text style={styles.required}>*</Text></Text>
              </View>
              <TextInput style={[styles.input, errors.itemName && styles.inputError]} placeholder={t("QuickAddItemScreen.placeholder_e_g_Milk_Tomato_R")} placeholderTextColor={Theme.colors.textPlaceholder} value={itemName} onChangeText={handleNameChange} autoCapitalize="words" />
              {errors.itemName && <Text style={styles.errorText}>{errors.itemName}</Text>}
            </View>

            {/* Category Selection */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Tag size={16} color={Theme.colors.accent} strokeWidth={2} />
                <Text style={[styles.label, { color: Theme.colors.accent }]}>{t("QuickAddItemScreen.Category")}<Text style={styles.required}>*</Text></Text>
              </View>
              <View style={styles.unitRow}>
                {CATEGORIES.map(cat => <TouchableOpacity key={cat} style={[styles.unitChip, category === cat && styles.unitChipSelected]} onPress={() => setCategory(cat)} activeOpacity={0.8}>
                    <Text style={[styles.unitChipText, category === cat && styles.unitChipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>)}
              </View>
            </View>

            {/* Quantity + Unit */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Scale size={16} color={Theme.colors.info} strokeWidth={2} />
                <Text style={[styles.label, { color: Theme.colors.info }]}>{t("QuickAddItemScreen.Quantity")}<Text style={styles.required}>*</Text></Text>
              </View>
              <View style={styles.rowInputs}>
                <TextInput style={[styles.input, styles.qtyInput, errors.quantity && styles.inputError]} placeholder="1" placeholderTextColor={Theme.colors.textPlaceholder} value={quantity} onChangeText={t => {
                setQuantity(t);
                setErrors(p => ({
                  ...p,
                  quantity: null
                }));
              }} keyboardType="decimal-pad" />
                <View style={styles.unitRow}>
                  {UNIT_OPTIONS.map(u => <TouchableOpacity key={u} style={[styles.unitChip, unit === u && styles.unitChipSelected]} onPress={() => setUnit(u)} activeOpacity={0.8}>
                      <Text style={[styles.unitChipText, unit === u && styles.unitChipTextSelected]}>
                        {u}
                      </Text>
                    </TouchableOpacity>)}
                </View>
              </View>
              {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
            </View>

            {/* Expiry Date */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Calendar size={16} color={Theme.colors.warning} strokeWidth={2} />
                <Text style={[styles.label, { color: Theme.colors.warning }]}>{t("QuickAddItemScreen.Expiry_Date")}<Text style={styles.required}>*</Text></Text>
              </View>
              <TextInput style={[styles.input, errors.expiryDate && styles.inputError]} placeholder={t("QuickAddItemScreen.placeholder_YYYY_MM_DD_e_g_20")} placeholderTextColor={Theme.colors.textPlaceholder} value={expiryDate} onChangeText={t => {
              setExpiryDate(t);
              setErrors(p => ({
                ...p,
                expiryDate: null
              }));
            }} keyboardType="numeric" maxLength={10} />
              {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
            </View>

            {/* Expiry Time */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Clock size={16} color={Theme.colors.danger} strokeWidth={2} />
                <Text style={[styles.label, { color: Theme.colors.danger }]}>{t("QuickAddItemScreen.Expiry_Time")}<Text style={styles.required}>*</Text></Text>
              </View>
              <TextInput style={[styles.input, errors.expiryTime && styles.inputError]} placeholder={t("QuickAddItemScreen.placeholder_HH_MM_e_g_23_59")} placeholderTextColor={Theme.colors.textPlaceholder} value={expiryTime} onChangeText={t => {
              setExpiryTime(t);
              setErrors(p => ({
                ...p,
                expiryTime: null
              }));
            }} keyboardType="numeric" maxLength={5} />
              {errors.expiryTime && <Text style={styles.errorText}>{errors.expiryTime}</Text>}
            </View>

            {/* Add Button */}
            <TouchableOpacity style={[styles.addBtnWrapper, loading && styles.addBtnDisabled]} onPress={handleAddItem} disabled={loading} activeOpacity={0.88}>
              <LinearGradient colors={Theme.gradients.primary} style={styles.addBtnGrad} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 0
            }}>
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <>
                    <Plus size={20} color="#fff" strokeWidth={2.5} />
                    <Text style={styles.addBtnText}>{t("QuickAddItemScreen.Add_Item_to_Pantry")}</Text>
                  </>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>;
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 16,
    paddingBottom: 16
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xs
  },
  headerTitle: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 20,
    color: Theme.colors.text
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
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
  fieldGroup: {
    marginBottom: 20
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6
  },
  label: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: Theme.colors.text
  },
  required: {
    color: Theme.colors.danger
  },
  optionalTag: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted
  },
  input: {
    borderWidth: 1.5,
    borderColor: Theme.colors.borderLight,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 15,
    color: Theme.colors.text,
    backgroundColor: Theme.colors.backgroundMid
  },
  inputError: {
    borderColor: Theme.colors.danger,
    backgroundColor: Theme.colors.dangerLight
  },
  errorText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.danger,
    marginTop: 4
  },
  rowInputs: {
    gap: 10
  },
  qtyInput: {
    width: 120
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Theme.colors.backgroundMid,
    borderWidth: 1.5,
    borderColor: Theme.colors.borderLight
  },
  unitChipSelected: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.primary
  },
  unitChipText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 13,
    color: Theme.colors.textMuted
  },
  unitChipTextSelected: {
    color: Theme.colors.primaryDark
  },
  addBtnWrapper: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    marginTop: 8,
    ...Theme.shadows.md
  },
  addBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.xl
  },
  addBtnDisabled: {
    opacity: 0.6
  },
  addBtnText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: '#fff'
  }
});
export default QuickAddItemScreen;