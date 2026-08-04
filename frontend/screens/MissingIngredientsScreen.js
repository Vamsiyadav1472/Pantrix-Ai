import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { Milk, Leaf, ShoppingBasket, Plus } from 'lucide-react-native';
import Button from '../components/Button';
const MissingIngredientsScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const missing = [{
    id: '1',
    name: 'Heavy Cream',
    recipe: 'Creamy Mushroom Pasta',
    icon: <Milk size={20} color={Theme.colors.accent} strokeWidth={1.8} />
  }, {
    id: '2',
    name: 'Parmesan Cheese',
    recipe: 'Creamy Mushroom Pasta',
    icon: <Milk size={20} color={Theme.colors.secondary} strokeWidth={1.8} />
  }, {
    id: '3',
    name: 'Asparagus',
    recipe: 'Grilled Salmon',
    icon: <Leaf size={20} color={Theme.colors.primary} strokeWidth={1.8} />
  }];
  const renderMissing = ({
    item
  }) => <View style={styles.card}>
      <View style={styles.iconBox}>
        {item.icon}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.recipe}>{t("MissingIngredientsScreen.For")}{item.recipe}</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Plus size={16} color={Theme.colors.primary} strokeWidth={2.5} />
        <Text style={styles.addButtonText}>{t("MissingIngredientsScreen.Add")}</Text>
      </TouchableOpacity>
    </View>;
  return <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("MissingIngredientsScreen.Missing_Ingredients")}</Text>
        <Text style={styles.subtitle}>{t("MissingIngredientsScreen.Items_needed_for_your_upcoming")}</Text>
      </View>
      <FlatList data={missing} renderItem={renderMissing} keyExtractor={item => item.id} contentContainerStyle={styles.list} />
      <View style={styles.footer}>
        <Button title={t("MissingIngredientsScreen.title_Add_All_to_Grocery_L")} onPress={() => navigation.navigate('Grocery')} icon={<ShoppingBasket size={20} color={Theme.colors.white} />} />
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border
  },
  title: {
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 24,
    color: Theme.colors.text
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 4
  },
  list: {
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
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontSize: 16,
    color: Theme.colors.text
  },
  recipe: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4
  },
  addButtonText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.primary,
    fontSize: 12
  },
  footer: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border
  }
});
export default MissingIngredientsScreen;