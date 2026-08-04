import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { Egg, Croissant, Milk, Plus, Sparkles } from 'lucide-react-native';
const SmartSuggestionsScreen = () => {
  const {
    t
  } = useTranslation();
  const suggestions = [{
    name: 'Eggs',
    reason: 'You usually buy these every Monday',
    icon: <Egg size={22} color={Theme.colors.secondary} strokeWidth={1.8} />
  }, {
    name: 'Bread',
    reason: 'Low stock based on your usage',
    icon: <Croissant size={22} color="#D97706" strokeWidth={1.8} />
  }, {
    name: 'Milk',
    reason: 'Running out soon',
    icon: <Milk size={22} color={Theme.colors.accent} strokeWidth={1.8} />
  }];
  return <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={22} color={Theme.colors.primary} strokeWidth={2} />
        <View style={{
        marginLeft: 12
      }}>
          <Text style={styles.title}>{t("SmartSuggestionsScreen.Smart_Suggestions")}</Text>
          <Text style={styles.subtitle}>{t("SmartSuggestionsScreen.Items_you_might_need_soon")}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {suggestions.map((item, index) => <View key={index} style={styles.card}>
            <View style={styles.iconBox}>
              {item.icon}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.reason}>{item.reason}</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color={Theme.colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>)}
      </ScrollView>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  header: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 22,
    color: Theme.colors.text
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  content: {
    padding: Theme.spacing.lg
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.white,
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: 12,
    alignItems: 'center',
    ...Theme.shadows.sm
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  info: {
    flex: 1
  },
  name: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 17,
    color: Theme.colors.text
  },
  reason: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
export default SmartSuggestionsScreen;