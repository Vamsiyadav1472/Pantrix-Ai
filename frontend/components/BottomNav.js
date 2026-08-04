// BottomNav is handled automatically by React Navigation's createBottomTabNavigator in App.js
// Use this component only if you want a fully custom nav bar without React Navigation.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TABS = [
  { name: 'Home',      icon: '🏠', screen: 'Home' },
  { name: 'Pantry',    icon: '🥡', screen: 'Pantry' },
  { name: 'Recipes',   icon: '🍳', screen: 'Recipes' },
  { name: 'Meal Plan', icon: '📅', screen: 'MealPlan' },
];

export default function BottomNav({ activeScreen, onNavigate }) {
  return (
    <View style={styles.nav}>
      {TABS.map(tab => {
        const isActive = activeScreen === tab.screen;
        return (
          <TouchableOpacity key={tab.name} style={styles.navItem} onPress={() => onNavigate(tab.screen)}>
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.name}</Text>
            {isActive && <View style={styles.navDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav:           { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: 16, paddingTop: 10 },
  navItem:       { flex: 1, alignItems: 'center', gap: 3 },
  navIcon:       { fontSize: 22 },
  navLabel:      { fontSize: 10, fontWeight: '600', color: '#bbb' },
  navLabelActive:{ color: '#0f3460' },
  navDot:        { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0f3460', marginTop: 2 },
});
