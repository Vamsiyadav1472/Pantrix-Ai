import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EMOJIS = ['🥘', '🍳', '🍛', '🥗', '🍜'];

export default function RecipeCard({ recipe, index, aiPowered }) {
  const allAvailable = recipe.available_items === recipe.total_items;
  return (
    <View style={styles.card}>
      <View style={styles.imgBox}>
        <Text style={{ fontSize: 65 }}>{EMOJIS[index % EMOJIS.length]}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.desc}>{recipe.description}</Text>
        <View style={styles.tags}>
          <View style={allAvailable ? styles.tagOk : styles.tagWarn}>
            <Text style={allAvailable ? styles.tagOkTxt : styles.tagWarnTxt}>
              {allAvailable
                ? `✅ ${recipe.available_items}/${recipe.total_items} available`
                : `⚠️ Missing ${recipe.total_items - recipe.available_items}`}
            </Text>
          </View>
          <View style={styles.tagAI}>
            <Text style={styles.tagAITxt}>{aiPowered ? '🤖 AI Pick' : '💡 Suggested'}</Text>
          </View>
          <View style={styles.tagNorm}>
            <Text style={styles.tagNormTxt}>⏱ {recipe.prep_time}min</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:       { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 14, elevation: 3 },
  imgBox:     { height: 110, backgroundColor: '#fff5f5', alignItems: 'center', justifyContent: 'center' },
  body:       { padding: 14 },
  title:      { fontSize: 15, fontWeight: '800' },
  desc:       { fontSize: 12, color: '#888', marginTop: 4 },
  tags:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tagOk:      { backgroundColor: '#dcfce7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tagOkTxt:   { fontSize: 10, fontWeight: '700', color: '#15803d' },
  tagWarn:    { backgroundColor: '#fee2e2', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tagWarnTxt: { fontSize: 10, fontWeight: '700', color: '#e94560' },
  tagAI:      { backgroundColor: '#ede9fe', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tagAITxt:   { fontSize: 10, fontWeight: '700', color: '#7c3aed' },
  tagNorm:    { backgroundColor: '#f0f2f5', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tagNormTxt: { fontSize: 10, fontWeight: '700', color: '#555' },
});
