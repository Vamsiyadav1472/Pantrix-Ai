import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
const AddGroceryItemScreen = () => {
  const {
    t
  } = useTranslation();
  return <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("AddGroceryItemScreen.Add_Grocery_Item")}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("AddGroceryItemScreen.Item_Name")}</Text>
          <TextInput style={styles.input} placeholder={t("AddGroceryItemScreen.placeholder_e_g_Milk_Apples")} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("AddGroceryItemScreen.Quantity_Optional")}</Text>
          <TextInput style={styles.input} placeholder={t("AddGroceryItemScreen.placeholder_e_g_1kg_2_packs")} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t("AddGroceryItemScreen.Category")}</Text>
          <View style={styles.chipGrid}>
            {['Fruits', 'Dairy', 'Vegetables', 'Snacks', 'Meat'].map((cat, i) => <TouchableOpacity key={i} style={styles.chip}>
                <Text style={styles.chipText}>{cat}</Text>
              </TouchableOpacity>)}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{t("AddGroceryItemScreen.Add_to_List")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.card
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text
  },
  content: {
    padding: 24
  },
  inputGroup: {
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8
  },
  chipText: {
    fontSize: 14,
    color: '#4B5563'
  },
  saveButton: {
    backgroundColor: '#059669',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20
  },
  saveButtonText: {
    color: Theme.colors.card,
    fontSize: 16,
    fontWeight: 'bold'
  }
});
export default AddGroceryItemScreen;