import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExpiryCard({ item }) {
  const days       = Math.ceil((new Date(item.expiry_date) - new Date()) / 86400000);
  const badgeColor = days <= 1 ? '#fee2e2' : days <= 3 ? '#fef9c3' : '#dcfce7';
  const textColor  = days <= 1 ? '#e94560' : days <= 3 ? '#ca8a04' : '#16a34a';

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{item.icon || '🥫'}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.quantity}{item.unit} · {item.category}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={[styles.badgeTxt, { color: textColor }]}>
          {days <= 0 ? 'Today!' : `${days}d`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:     { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10, elevation: 2 },
  icon:     { fontSize: 30 },
  info:     { flex: 1 },
  name:     { fontSize: 14, fontWeight: '700' },
  sub:      { fontSize: 12, color: '#888', marginTop: 2 },
  badge:    { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
});
