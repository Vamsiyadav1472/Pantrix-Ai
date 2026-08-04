import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme';
const MyKitchenScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [kitchenName, setKitchenName] = useState('');
  const [cookingStyle, setCookingStyle] = useState('');
  const [pantryType, setPantryType] = useState('');
  const [preferredCuisine, setPreferredCuisine] = useState('');
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!kitchenName.trim()) {
      Alert.alert('Required', 'Please enter kitchen name');
      return;
    }
    try {
      setSaving(true);
      const kitchenData = {
        kitchenName,
        cookingStyle,
        pantryType,
        preferredCuisine
      };
      await AsyncStorage.setItem('myKitchenData', JSON.stringify(kitchenData));
      Alert.alert('Success', 'My Kitchen details saved successfully');
      navigation.goBack();
    } catch (error) {
      console.log('Error saving kitchen data:', error);
      Alert.alert('Error', 'Failed to save kitchen details');
    } finally {
      setSaving(false);
    }
  };
  return <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("MyKitchenScreen.My_Kitchen")}</Text>
                <Text style={styles.subtitle}>{t("MyKitchenScreen.Set_your_kitchen_details_for_b")}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>{t("MyKitchenScreen.Kitchen_Name")}</Text>
                    <TextInput style={styles.input} placeholder={t("MyKitchenScreen.placeholder_Example_Vamsi_s_Kit")} value={kitchenName} onChangeText={setKitchenName} placeholderTextColor="#9CA3AF" />

                    <Text style={styles.label}>{t("MyKitchenScreen.Cooking_Style")}</Text>
                    <TextInput style={styles.input} placeholder={t("MyKitchenScreen.placeholder_Example_Home_cookin")} value={cookingStyle} onChangeText={setCookingStyle} placeholderTextColor="#9CA3AF" />

                    <Text style={styles.label}>{t("MyKitchenScreen.Pantry_Type")}</Text>
                    <TextInput style={styles.input} placeholder={t("MyKitchenScreen.placeholder_Example_Vegetarian")} value={pantryType} onChangeText={setPantryType} placeholderTextColor="#9CA3AF" />

                    <Text style={styles.label}>{t("MyKitchenScreen.Preferred_Cuisine")}</Text>
                    <TextInput style={styles.input} placeholder={t("MyKitchenScreen.placeholder_Example_South_India")} value={preferredCuisine} onChangeText={setPreferredCuisine} placeholderTextColor="#9CA3AF" />
                </View>

                <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>{t("MyKitchenScreen.Save_Kitchen_Details")}</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>;
};
export default MyKitchenScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme?.colors?.background || '#F9FAF7'
  },
  header: {
    backgroundColor: Theme?.colors?.white || Theme.colors.card,
    padding: 24
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Theme?.colors?.text || Theme.colors.text
  },
  subtitle: {
    fontSize: 14,
    color: Theme?.colors?.textLight || '#6B7280',
    marginTop: 6,
    lineHeight: 20
  },
  content: {
    padding: 24
  },
  card: {
    backgroundColor: Theme?.colors?.white || Theme.colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Theme?.colors?.border || '#E5E7EB',
    marginBottom: 24
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme?.colors?.text || Theme.colors.text,
    marginBottom: 8,
    marginTop: 10
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: Theme?.colors?.border || '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Theme?.colors?.text || Theme.colors.text,
    marginBottom: 10
  },
  saveButton: {
    backgroundColor: Theme?.colors?.primary || '#16A34A',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center'
  },
  disabledButton: {
    opacity: 0.7
  },
  saveButtonText: {
    color: Theme.colors.card,
    fontSize: 16,
    fontWeight: '800'
  }
});