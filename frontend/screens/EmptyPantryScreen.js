import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PackageOpen, Plus, Scan, Sparkles } from 'lucide-react-native';
const {
  width
} = Dimensions.get('window');
const EmptyPantryScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Theme.colors.background, Theme.colors.backgroundMid, '#E8FDF3']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        {/* Floating Icons Background */}
        <View style={styles.floatingIcons}>
          <View style={[styles.floatIcon, {
          top: 40,
          left: 20
        }]}>
            <Text style={{
            fontSize: 24,
            opacity: 0.6
          }}>🍎</Text>
          </View>
          <View style={[styles.floatIcon, {
          top: 100,
          right: 30
        }]}>
            <Text style={{
            fontSize: 28,
            opacity: 0.6
          }}>🥛</Text>
          </View>
          <View style={[styles.floatIcon, {
          bottom: 120,
          left: 40
        }]}>
            <Text style={{
            fontSize: 22,
            opacity: 0.6
          }}>🥦</Text>
          </View>
          <View style={[styles.floatIcon, {
          bottom: 80,
          right: 40
        }]}>
            <Text style={{
            fontSize: 26,
            opacity: 0.6
          }}>🍞</Text>
          </View>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationWrap}>
          <LinearGradient colors={[Theme.colors.card, Theme.colors.backgroundMid]} style={styles.illustrationBg}>
            <PackageOpen size={72} color="#059669" strokeWidth={1.5} />
          </LinearGradient>
          <View style={styles.sparkleBadge}>
            <Sparkles size={16} color="#F59E0B" fill="#F59E0B" />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>{t("EmptyPantryScreen.Your_Pantry_is_Empty")}</Text>
        <Text style={styles.description}>{t("EmptyPantryScreen.Start_adding_items_to_your_pan")}</Text>
        
        {/* Actions */}
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.primaryBtnWrapper} activeOpacity={0.8} onPress={() => navigation.navigate('AddItem')}>
            <LinearGradient colors={['#059669', '#10B981']} style={styles.primaryBtn} start={{
            x: 0,
            y: 0
          }} end={{
            x: 1,
            y: 1
          }}>
              <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.primaryBtnText}>{t("EmptyPantryScreen.Add_Your_First_Item")}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7} onPress={() => navigation.navigate('BarcodeScanner')}>
            <View style={styles.scanIconBg}>
              <Scan size={18} color="#059669" strokeWidth={2.5} />
            </View>
            <Text style={styles.secondaryBtnText}>{t("EmptyPantryScreen.Scan_a_Barcode")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  floatingIcons: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1
  },
  floatIcon: {
    position: 'absolute'
  },
  illustrationWrap: {
    position: 'relative',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8
  },
  illustrationBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Theme.colors.card
  },
  sparkleBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Theme.colors.card,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 16,
    textAlign: 'center'
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20
  },
  actionGroup: {
    width: '100%',
    gap: 16
  },
  primaryBtnWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10
  },
  primaryBtnText: {
    color: Theme.colors.card,
    fontSize: 16,
    fontWeight: '700'
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Theme.colors.card,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 12
  },
  scanIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Theme.colors.backgroundMid,
    justifyContent: 'center',
    alignItems: 'center'
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700'
  }
});
export default EmptyPantryScreen;