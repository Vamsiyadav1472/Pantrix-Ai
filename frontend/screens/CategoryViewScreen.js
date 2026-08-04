import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { Leaf, Milk, Drumstick, Wheat, Snowflake, CupSoda } from 'lucide-react-native';
const CategoryViewScreen = () => {
  const {
    t
  } = useTranslation();
  const categories = [{
    id: '1',
    name: 'Produce',
    count: 12,
    icon: <Leaf size={32} color="#059669" strokeWidth={1.8} />,
    color: '#DCFCE7'
  }, {
    id: '2',
    name: 'Dairy',
    count: 5,
    icon: <Milk size={32} color="#D97706" strokeWidth={1.8} />,
    color: '#FEF3C7'
  }, {
    id: '3',
    name: 'Meat',
    count: 3,
    icon: <Drumstick size={32} color="#DC2626" strokeWidth={1.8} />,
    color: '#FEE2E2'
  }, {
    id: '4',
    name: 'Dry Goods',
    count: 15,
    icon: <Wheat size={32} color="#2563EB" strokeWidth={1.8} />,
    color: '#DBEAFE'
  }, {
    id: '5',
    name: 'Frozen',
    count: 8,
    icon: <Snowflake size={32} color="#6366F1" strokeWidth={1.8} />,
    color: '#E0E7FF'
  }, {
    id: '6',
    name: 'Beverages',
    count: 10,
    icon: <CupSoda size={32} color="#9333EA" strokeWidth={1.8} />,
    color: '#F3E8FF'
  }];
  const renderCategory = ({
    item
  }) => <TouchableOpacity style={[styles.card, {
    backgroundColor: item.color
  }]}>
      {item.icon}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.count}>{item.count}{t("CategoryViewScreen.items")}</Text>
    </TouchableOpacity>;
  return <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("CategoryViewScreen.Categories")}</Text>
      </View>
      <FlatList data={categories} renderItem={renderCategory} keyExtractor={item => item.id} numColumns={2} contentContainerStyle={styles.listContent} columnWrapperStyle={styles.columnWrapper} />
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
  listContent: {
    padding: 16
  },
  columnWrapper: {
    justifyContent: 'space-between'
  },
  card: {
    width: '48%',
    padding: 24,
    borderRadius: Theme.borderRadius.xl,
    marginBottom: 16,
    alignItems: 'center'
  },
  name: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 16,
    color: Theme.colors.text,
    marginTop: 12
  },
  count: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 4
  }
});
export default CategoryViewScreen;