import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react-native';
import { authService } from '../services/api';
import Button from '../components/Button';
import { Theme } from '../theme';
const EmailVerificationScreen = ({
  navigation,
  route
}) => {
  const {
    t
  } = useTranslation();
  const {
    email
  } = route.params || {
    email: 'your email'
  };
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otpFocused, setOtpFocused] = useState(false);
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);
  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp({
        email,
        otp
      });
      setLoading(false);
      Alert.alert('Success', 'Account created successfully.');
      navigation.replace('Login');
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.detail || 'Verification failed.';
      Alert.alert('Verification Error', message);
    }
  };
  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await authService.register({
        username: email.split('@')[0],
        email: email,
        password: "Temp123!Password",
        full_name: "Temp Name"
      });
      setTimer(60);
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };
  return <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <LinearGradient colors={['#064E3B', '#059669', '#22C55E']} style={styles.heroSection} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
            
            <View style={styles.logoWrap}>
              <View style={styles.logoCircle}>
                <Mail size={32} color={Theme.colors.primary} />
              </View>
            </View>
            <Text style={styles.heroTitle}>{t("EmailVerificationScreen.Verify_Email")}</Text>
            <Text style={styles.heroSubtitle}>{t("EmailVerificationScreen.We_ve_sent_a_6_digit_code_to")}</Text>
            <Text style={styles.emailText}>{email}</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formCard}>
            
            {/* OTP Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("EmailVerificationScreen.Verification_Code")}</Text>
              <View style={[styles.inputWrapper, otpFocused && styles.inputFocused]}>
                <KeyRound size={18} color={otpFocused ? Theme.colors.primary : Theme.colors.textLight} />
                <TextInput placeholder={t("EmailVerificationScreen.placeholder_Enter_6_digit_code")} placeholderTextColor={Theme.colors.textPlaceholder} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} style={styles.input} onFocus={() => setOtpFocused(true)} onBlur={() => setOtpFocused(false)} />
              </View>
            </View>

            {/* Verify Button */}
            <Button title={loading ? "Verifying..." : "Verify"} onPress={handleVerify} loading={loading} variant="primary" size="lg" style={styles.primaryButton} />

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <Text style={styles.footerText}>{t("EmailVerificationScreen.Didn_t_receive_the_code")}</Text>
              {timer > 0 ? <Text style={styles.timerText}>{t("EmailVerificationScreen.Resend_in")}{timer}{t("EmailVerificationScreen.s")}</Text> : <TouchableOpacity onPress={handleResend} disabled={loading}>
                  <Text style={styles.resendText}>{t("EmailVerificationScreen.Resend_OTP")}</Text>
                </TouchableOpacity>}
            </View>

            <TouchableOpacity style={styles.changeEmailButton} onPress={() => navigation.goBack()}>
               <Text style={styles.changeEmailText}>{t("EmailVerificationScreen.Change_Email_Address")}</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>;
};
export default EmailVerificationScreen;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#064E3B'
  },
  flex: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  heroSection: {
    paddingTop: 48,
    paddingBottom: 44,
    paddingHorizontal: 28,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 10,
    padding: 8
  },
  heroCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -50,
    right: -50
  },
  heroCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -30
  },
  logoWrap: {
    marginBottom: 14
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    color: Theme.colors.card,
    letterSpacing: -0.3,
    textAlign: 'center'
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    textAlign: 'center'
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Theme.colors.card,
    marginTop: 4,
    textAlign: 'center'
  },
  formCard: {
    backgroundColor: Theme.colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: 28,
    paddingBottom: 40,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8
  },
  inputGroup: {
    marginBottom: 24,
    marginTop: 10
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Theme.colors.textMuted,
    marginBottom: 8,
    letterSpacing: 0.3
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.backgroundMid,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 12
  },
  inputFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: Theme.colors.text,
    letterSpacing: 4
  },
  primaryButton: {
    marginBottom: 24
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  footerText: {
    color: Theme.colors.textMuted,
    fontSize: 15,
    fontFamily: 'Inter_400Regular'
  },
  timerText: {
    color: Theme.colors.textLight,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold'
  },
  resendText: {
    color: Theme.colors.primary,
    fontSize: 15,
    fontFamily: 'Outfit_700Bold'
  },
  changeEmailButton: {
    alignItems: 'center',
    marginTop: 10
  },
  changeEmailText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline'
  }
});