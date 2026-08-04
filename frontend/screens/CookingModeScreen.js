import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, X, Clock, Play, Pause, RotateCcw, Volume2 } from 'lucide-react-native';
import { Theme } from '../theme';
const {
  width
} = Dimensions.get('window');
const CookingModeScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [step, setStep] = useState(1);
  const [seconds, setSeconds] = useState(600); // 10 minutes default
  const [timerRunning, setTimerRunning] = useState(false);
  const totalSteps = 4;
  const instructions = ["Boil pasta in salted water until al dente. Save 1/2 cup of pasta water.", "Sauté minced garlic and sliced mushrooms in olive oil until golden brown.", "Lower heat, add heavy cream and simmer for 5 minutes until slightly thickened.", "Toss cooked pasta with the sauce, adding pasta water if needed. Serve with parmesan."];
  useEffect(() => {
    let interval = null;
    if (timerRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, seconds]);
  const formatTime = totalSec => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const handleClose = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };
  return <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#064E3B', '#059669', '#10B981']} style={styles.headerGradient} start={{
      x: 0,
      y: 0
    }} end={{
      x: 1,
      y: 1
    }}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>{t("CookingModeScreen.COOKING_MODE")}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.voiceReadyContainer}>
          <Volume2 size={16} color="rgba(255,255,255,0.9)" />
          <Text style={styles.voiceReadyText}>{t("CookingModeScreen.Voice_ready_mode_active_Hand")}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Progress Tracker */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.stepText}>{t("CookingModeScreen.STEP")}{step}{t("CookingModeScreen.OF")}{totalSteps}</Text>
            <Text style={styles.progressPercent}>{Math.round(step / totalSteps * 100)}{t("CookingModeScreen._Complete")}</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient colors={Theme.gradients.primary} style={[styles.progressFill, {
            width: `${step / totalSteps * 100}%`
          }]} start={{
            x: 0,
            y: 0
          }} end={{
            x: 1,
            y: 0
          }} />
          </View>
        </View>

        {/* Step Card */}
        <View style={styles.instructionCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>{step}</Text>
          </View>
          <Text style={styles.instruction}>{instructions[step - 1]}</Text>
        </View>

        {/* Timer Card */}
        <View style={styles.timerContainer}>
          <View style={styles.timerBox}>
            <Clock size={20} color={Theme.colors.primary} style={{
            marginBottom: 4
          }} />
            <Text style={styles.timerValue}>{formatTime(seconds)}</Text>
            <Text style={styles.timerLabel}>{t("CookingModeScreen.Step_Timer")}</Text>
          </View>
          <View style={styles.timerControls}>
            <TouchableOpacity style={styles.timerAction} onPress={() => setTimerRunning(!timerRunning)} activeOpacity={0.8}>
              <LinearGradient colors={timerRunning ? Theme.gradients.amber : Theme.gradients.primary} style={styles.timerActionGrad} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 0
            }}>
                {timerRunning ? <Pause size={18} color="#FFFFFF" /> : <Play size={18} color="#FFFFFF" />}
                <Text style={styles.timerActionText}>
                  {timerRunning ? 'Pause Timer' : 'Start Timer'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={() => {
            setTimerRunning(false);
            setSeconds(600);
          }}>
              <RotateCcw size={16} color={Theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.navButton, styles.prevButton, step === 1 && styles.disabledButton]} onPress={() => step > 1 && setStep(step - 1)} disabled={step === 1} activeOpacity={0.8}>
          <ChevronLeft size={20} color={step === 1 ? Theme.colors.textLight : Theme.colors.text} />
          <Text style={[styles.prevButtonText, step === 1 && styles.disabledText]}>{t("CookingModeScreen.Previous")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={() => step < totalSteps ? setStep(step + 1) : handleClose()} activeOpacity={0.88}>
          <LinearGradient colors={Theme.gradients.primary} style={styles.nextGrad} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 0
        }}>
            <Text style={styles.navButtonText}>
              {step === totalSteps ? 'Finish Cooking' : 'Next Step'}
            </Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064E3B'
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80'
  },
  liveBadgeText: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.card,
    letterSpacing: 0.8
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  voiceReadyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14
  },
  voiceReadyText: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.body,
    color: 'rgba(255,255,255,0.85)'
  },
  content: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: 'space-between'
  },
  progressContainer: {
    marginBottom: 16
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  stepText: {
    fontSize: 12,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.textMuted,
    letterSpacing: 0.8
  },
  progressPercent: {
    fontSize: 13,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.primary
  },
  progressBar: {
    height: 10,
    backgroundColor: Theme.colors.border,
    borderRadius: 5,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 5
  },
  instructionCard: {
    backgroundColor: Theme.colors.card,
    padding: 28,
    borderRadius: 24,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.sm,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    position: 'relative',
    marginVertical: 12
  },
  stepNumberBadge: {
    position: 'absolute',
    top: -16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.sm
  },
  stepNumberText: {
    color: Theme.colors.card,
    fontFamily: Theme.typography.fontFamily.heading,
    fontSize: 16
  },
  instruction: {
    fontSize: 20,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.text,
    textAlign: 'center',
    lineHeight: 30,
    marginTop: 8
  },
  timerContainer: {
    backgroundColor: Theme.colors.card,
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    ...Theme.shadows.xs,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight
  },
  timerBox: {
    alignItems: 'center'
  },
  timerValue: {
    fontSize: 36,
    fontFamily: Theme.typography.fontFamily.heading,
    color: Theme.colors.text,
    letterSpacing: -1
  },
  timerLabel: {
    fontSize: 11,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14
  },
  timerAction: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    ...Theme.shadows.sm
  },
  timerActionGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.xl
  },
  timerActionText: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 14,
    color: Theme.colors.card
  },
  resetBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.backgroundMid,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Theme.colors.card,
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight
  },
  navButton: {
    height: 52,
    borderRadius: Theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center'
  },
  prevButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: Theme.colors.backgroundMid,
    borderWidth: 1,
    borderColor: Theme.colors.border
  },
  prevButtonText: {
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: Theme.colors.text
  },
  nextButton: {
    flex: 1.4,
    overflow: 'hidden',
    ...Theme.shadows.md
  },
  nextGrad: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Theme.borderRadius.xl
  },
  disabledButton: {
    backgroundColor: Theme.colors.borderLight,
    borderColor: 'transparent'
  },
  disabledText: {
    color: Theme.colors.textLight
  },
  navButtonText: {
    color: Theme.colors.card,
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold
  }
});
export default CookingModeScreen;