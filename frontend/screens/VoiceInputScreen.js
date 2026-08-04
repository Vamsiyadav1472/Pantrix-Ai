import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
const VoiceInputScreen = () => {
  const {
    t
  } = useTranslation();
  return <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("VoiceInputScreen.Listening")}</Text>
        <Text style={styles.transcript}>{t("VoiceInputScreen._Add_three_avocados_and_a_cart")}</Text>

        <View style={styles.waveContainer}>
          {[1, 2, 3, 4, 5].map(i => <View key={i} style={[styles.wave, {
          height: 20 + Math.random() * 60
        }]} />)}
        </View>

        <TouchableOpacity style={styles.micButton}>
          <Text style={styles.micEmoji}>🎤</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>{t("VoiceInputScreen.Tap_to_stop_listening")}</Text>
      </View>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#059669'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.card,
    marginBottom: 20,
    opacity: 0.8
  },
  transcript: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.card,
    textAlign: 'center',
    marginBottom: 60
  },
  waveContainer: {
    flexDirection: 'row',
    height: 100,
    alignItems: 'center',
    marginBottom: 60
  },
  wave: {
    width: 8,
    backgroundColor: Theme.colors.card,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.5
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  micEmoji: {
    fontSize: 40
  },
  hint: {
    marginTop: 30,
    color: Theme.colors.card,
    fontSize: 16,
    opacity: 0.7
  }
});
export default VoiceInputScreen;