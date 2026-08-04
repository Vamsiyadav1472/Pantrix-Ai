import { useTranslation } from "react-i18next";
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';
import Svg, { Circle, Path, Line } from 'react-native-svg';
const {
  width,
  height
} = Dimensions.get('window');

// Decorative sparkle SVG
const SparkleIcon = ({
  size = 24,
  color = Theme.colors.card,
  opacity = 0.5
}) => <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" fill={color} opacity={opacity} />
  </Svg>;
const SplashScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const spark1 = useRef(new Animated.Value(0)).current;
  const spark2 = useRef(new Animated.Value(0)).current;
  const footerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Logo entrance
    Animated.parallel([Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true
    }), Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true
    })]).start(() => {
      // Text fade-in after logo
      Animated.parallel([Animated.timing(textFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }), Animated.timing(spark1, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }), Animated.timing(spark2, {
        toValue: 1,
        duration: 700,
        delay: 100,
        useNativeDriver: true
      }), Animated.timing(footerFade, {
        toValue: 1,
        duration: 700,
        delay: 300,
        useNativeDriver: true
      })]).start();

      // Pulse loop
      Animated.loop(Animated.sequence([Animated.timing(pulse, {
        toValue: 1.05,
        duration: 1200,
        useNativeDriver: true
      }), Animated.timing(pulse, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      })])).start();

      // Navigate after delay
      setTimeout(() => {
        navigation.replace('Onboarding1');
      }, 2500);
    });
  }, []);
  return <LinearGradient colors={['#064E3B', '#059669', '#22C55E', '#4ADE80']} style={styles.container} start={{
    x: 0.1,
    y: 0
  }} end={{
    x: 0.9,
    y: 1
  }}>
      {/* Decorative background circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      {/* Sparkle decorations */}
      <Animated.View style={[styles.sparkle1, {
      opacity: spark1
    }]}>
        <SparkleIcon size={20} color="#FFFFFF" opacity={0.7} />
      </Animated.View>
      <Animated.View style={[styles.sparkle2, {
      opacity: spark2
    }]}>
        <SparkleIcon size={14} color="#D1FAE5" opacity={0.8} />
      </Animated.View>
      <Animated.View style={[styles.sparkle3, {
      opacity: spark1
    }]}>
        <SparkleIcon size={18} color="#FFFFFF" opacity={0.5} />
      </Animated.View>

      {/* Main logo content */}
      <Animated.View style={[styles.logoContainer, {
      opacity: fadeAnim,
      transform: [{
        scale: scaleAnim
      }]
    }]}>
        {/* Outer glow ring */}
        <Animated.View style={[styles.glowRing, {
        transform: [{
          scale: pulse
        }]
      }]} />

        {/* Logo circle */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
      </Animated.View>

      {/* Text block */}
      <Animated.View style={[styles.textBlock, {
      opacity: textFade
    }]}>
        <Text style={styles.title}>{t("SplashScreen.PantrixAI")}</Text>
        <Text style={styles.subtitle}>{t("SplashScreen.Smart_Pantry_Better_Living")}</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>{t("SplashScreen.AI_Powered_Kitchen_Intelligenc")}</Text>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, {
      opacity: footerFade
    }]}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.footerText}>{t("SplashScreen.Powered_by_Gemini_Groq_AI")}</Text>
      </Animated.View>
    </LinearGradient>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Background decorative circles
  circle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -80,
    right: -100
  },
  circle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -50,
    left: -70
  },
  circle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    top: height * 0.35,
    left: -40
  },
  // Sparkles
  sparkle1: {
    position: 'absolute',
    top: height * 0.22,
    right: 50
  },
  sparkle2: {
    position: 'absolute',
    top: height * 0.18,
    left: 55
  },
  sparkle3: {
    position: 'absolute',
    bottom: height * 0.25,
    right: 70
  },
  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16
  },
  logoEmoji: {
    fontSize: 64
  },
  // Text
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 40
  },
  title: {
    fontSize: 46,
    fontFamily: 'Outfit_700Bold',
    color: Theme.colors.card,
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {
      width: 0,
      height: 2
    },
    textShadowRadius: 8
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 8,
    letterSpacing: 0.5
  },
  divider: {
    width: 48,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    marginVertical: 16
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
    gap: 12
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)'
  },
  dotActive: {
    width: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 3
  },
  footerText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.8
  }
});
export default SplashScreen;