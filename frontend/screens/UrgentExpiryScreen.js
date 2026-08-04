import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
const UrgentExpiryScreen = () => {
  const {
    t
  } = useTranslation();
  return <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.warningCircle}>
          <Text style={styles.warningIcon}>⚠️</Text>
        </View>
        <Text style={styles.title}>{t("UrgentExpiryScreen.Urgent_Action_Needed")}</Text>
        <Text style={styles.subtitle}>{t("UrgentExpiryScreen.The_following_items_are_expiri")}</Text>

        <ScrollView style={styles.itemList}>
          {['Chicken Breast', 'Fresh Spinach', 'Greek Yogurt'].map((item, index) => <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>• {item}</Text>
            </View>)}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.recipeButton}>
            <Text style={styles.recipeButtonText}>{t("UrgentExpiryScreen.Find_Recipes_for_These")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismissButton}>
            <Text style={styles.dismissButtonText}>{t("UrgentExpiryScreen.I_ve_used_these_items")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF1F2'
  },
  content: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  warningCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  warningIcon: {
    fontSize: 50
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9F1239',
    textAlign: 'center',
    marginBottom: 16
  },
  subtitle: {
    fontSize: 16,
    color: '#BE123C',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  itemList: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 40
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FDA4AF'
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#881337'
  },
  actions: {
    width: '100%'
  },
  recipeButton: {
    backgroundColor: '#E11D48',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  recipeButtonText: {
    color: Theme.colors.card,
    fontSize: 16,
    fontWeight: 'bold'
  },
  dismissButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDA4AF'
  },
  dismissButtonText: {
    color: '#E11D48',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
export default UrgentExpiryScreen;