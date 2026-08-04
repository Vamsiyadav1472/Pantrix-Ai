import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, TextInput, Dimensions, ScrollView, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ChevronLeft, ShieldCheck, KeyRound, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { userService } from '../services/api';
import { Theme } from '../theme';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Form
  const [loading, setLoading] = useState(false);
  
  const [emailFocused, setEmailFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [newPassFocused, setNewPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleSendCode = async (isResend = false) => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      await userService.forgotPassword({ email });
      setLoading(false);
      setStep(2);
      Alert.alert(isResend ? "Code Resent" : "Code Sent", "Please check your email for the verification code.");
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error.response?.data?.detail || "Failed to send code.");
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await userService.resetPassword({
        email,
        code,
        new_password: newPassword
      });
      setLoading(false);
      Alert.alert("Success", "Password reset successfully! Please login with your new password.", [{
        text: "Go to Login",
        onPress: () => navigation.replace('Login')
      }]);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", error.response?.data?.detail || "Failed to reset password. Check your code.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      <LinearGradient 
        colors={Theme.gradients.background} 
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
        >
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
              <View style={styles.iconWrapper}>
                <ShieldCheck size={36} color="#ffffff" strokeWidth={1.5} />
              </View>
              <Text style={styles.headerTitle}>{step === 1 ? "Forgot Password?" : "Reset Password"}</Text>
              <Text style={styles.headerSubtitle}>
                {step === 1 ? "Enter your registered email address and we will send you a verification code." : `Enter the code sent to ${email} along with your new password.`}
              </Text>
            </Animated.View>

            <Animated.View style={[styles.glassCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              
              {step === 1 ? (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t("ForgotPasswordScreen.label_Email_Address", { defaultValue: 'Email Address' })}</Text>
                    <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                      <Mail size={20} color={emailFocused ? '#10b981' : '#94a3b8'} />
                      <TextInput 
                        placeholder={t("ForgotPasswordScreen.placeholder_name_example_com", { defaultValue: 'Enter your email' })} 
                        placeholderTextColor="#64748b" 
                        value={email} 
                        onChangeText={setEmail} 
                        keyboardType="email-address" 
                        autoCapitalize="none" 
                        style={styles.input} 
                        onFocus={() => setEmailFocused(true)} 
                        onBlur={() => setEmailFocused(false)} 
                      />
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.primaryButtonWrapper, loading && styles.primaryButtonLoading]} 
                    onPress={() => handleSendCode(false)} 
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient 
                      colors={Theme.gradients.primary} 
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>{loading ? 'Sending...' : t("ForgotPasswordScreen.title_Send_Reset_Code", { defaultValue: 'Send Reset Code' })}</Text>
                      {!loading && <ArrowRight size={20} color="#ffffff" />}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t("ForgotPasswordScreen.label_Verification_Code", { defaultValue: 'Verification Code' })}</Text>
                    <View style={[styles.inputWrapper, codeFocused && styles.inputFocused]}>
                      <KeyRound size={20} color={codeFocused ? '#10b981' : '#94a3b8'} />
                      <TextInput 
                        placeholder="123456" 
                        placeholderTextColor="#64748b" 
                        value={code} 
                        onChangeText={setCode} 
                        keyboardType="number-pad"
                        maxLength={6}
                        style={styles.input} 
                        onFocus={() => setCodeFocused(true)} 
                        onBlur={() => setCodeFocused(false)} 
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t("ForgotPasswordScreen.label_New_Password", { defaultValue: 'New Password' })}</Text>
                    <View style={[styles.inputWrapper, newPassFocused && styles.inputFocused]}>
                      <Lock size={20} color={newPassFocused ? '#10b981' : '#94a3b8'} />
                      <TextInput 
                        placeholder={t("ForgotPasswordScreen.placeholder_Min_8_characters", { defaultValue: 'Min 8 characters' })} 
                        placeholderTextColor="#64748b" 
                        value={newPassword} 
                        onChangeText={setNewPassword} 
                        secureTextEntry={!showNewPassword} 
                        style={styles.input} 
                        onFocus={() => setNewPassFocused(true)} 
                        onBlur={() => setNewPassFocused(false)} 
                      />
                      <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        {showNewPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t("ForgotPasswordScreen.label_Confirm_New_Password", { defaultValue: 'Confirm New Password' })}</Text>
                    <View style={[styles.inputWrapper, confirmPassFocused && styles.inputFocused]}>
                      <Lock size={20} color={confirmPassFocused ? '#10b981' : '#94a3b8'} />
                      <TextInput 
                        placeholder={t("ForgotPasswordScreen.placeholder_Re_enter_new_passwor", { defaultValue: 'Re-enter new password' })} 
                        placeholderTextColor="#64748b" 
                        value={confirmPassword} 
                        onChangeText={setConfirmPassword} 
                        secureTextEntry={!showConfirmPassword} 
                        style={styles.input} 
                        onFocus={() => setConfirmPassFocused(true)} 
                        onBlur={() => setConfirmPassFocused(false)} 
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        {showConfirmPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryButtonWrapper, loading && styles.primaryButtonLoading]} 
                    onPress={handleResetPassword} 
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient 
                      colors={Theme.gradients.primary} 
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>{loading ? 'Resetting...' : t("ForgotPasswordScreen.title_Reset_Password", { defaultValue: 'Reset Password' })}</Text>
                      {!loading && <ArrowRight size={20} color="#ffffff" />}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <TouchableOpacity onPress={() => handleSendCode(true)} disabled={loading} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Text style={styles.resendText}>{t("ForgotPasswordScreen.Didn_t_receive_code_Resend_Co", { defaultValue: "Didn't receive code? Resend Code" })}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  backgroundGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  glowOrb1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    top: -height * 0.1,
    right: -width * 0.2,
    filter: 'blur(40px)',
  },
  glowOrb2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    bottom: height * 0.1,
    left: -width * 0.2,
    filter: 'blur(40px)',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: height * 0.08,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: Theme.typography.fontFamily.heading,
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
  },
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    color: '#cbd5e1',
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  inputFocused: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: Theme.typography.fontFamily.body,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  primaryButtonWrapper: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 8,
  },
  primaryButtonLoading: {
    opacity: 0.7,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: '#10b981',
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
});