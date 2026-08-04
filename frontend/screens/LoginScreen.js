import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, TextInput, Dimensions, ScrollView, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react-native';
import { authService } from '../services/api';
import { Theme } from '../theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

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

  const saveUserData = async (responseData, fallbackEmail) => {
    const data = responseData || {};
    const user = data.user || data;
    const realName = user.full_name || user.name || user.username || data.full_name || data.name || data.username || fallbackEmail.split('@')[0];
    const userData = {
      id: user.id || user.user_id || data.id || data.user_id || 1,
      user_id: user.user_id || user.id || data.user_id || data.id || 1,
      full_name: realName,
      name: realName,
      username: realName,
      email: user.email || data.email || fallbackEmail,
      token: data.token || data.access_token || user.token || ''
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Details', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.data) {
        await saveUserData(response.data, email);
        setLoading(false);
        navigation.replace('Main');
      } else {
        setLoading(false);
        Alert.alert('Login Error', 'Invalid server response');
      }
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.detail || error.message || 'Something went wrong.';
      if (error.response?.status === 403) {
        Alert.alert('Verification Required', error.response?.data?.detail || 'Please verify your email before logging in.', [
          { text: 'Verify Now', onPress: () => navigation.navigate('EmailVerification', { email }) },
          { text: 'Cancel', style: 'cancel' }
        ]);
      } else if (error.response?.status === 401) {
        Alert.alert('Login Failed', 'Invalid email or password.');
      } else if (error.response?.status === 404) {
        Alert.alert('No Account Detected', message, [
          { text: 'Sign Up', onPress: () => navigation.navigate('Signup') },
          { text: 'Try Again', style: 'cancel' }
        ]);
      } else {
        Alert.alert('Login Error', message);
      }
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

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
              <View style={styles.iconWrapper}>
                <Sparkles size={36} color="#ffffff" strokeWidth={1.5} />
              </View>
              <Text style={styles.headerTitle}>{t("LoginScreen.Welcome_Back", { defaultValue: 'Welcome Back' })}</Text>
              <Text style={styles.headerSubtitle}>{t("LoginScreen.Sign_in_to_your_PantrixAI_acco", { defaultValue: 'Sign in to continue your journey' })}</Text>
            </Animated.View>

            <Animated.View style={[styles.glassCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("LoginScreen.Email_Address", { defaultValue: 'Email Address' })}</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                  <Mail size={20} color={emailFocused ? '#10b981' : '#94a3b8'} />
                  <TextInput 
                    placeholder={t("LoginScreen.placeholder_Enter_your_email", { defaultValue: 'Enter your email' })} 
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("LoginScreen.Password", { defaultValue: 'Password' })}</Text>
                <View style={[styles.inputWrapper, passFocused && styles.inputFocused]}>
                  <Lock size={20} color={passFocused ? '#10b981' : '#94a3b8'} />
                  <TextInput 
                    placeholder={t("LoginScreen.placeholder_Enter_your_password", { defaultValue: 'Enter your password' })} 
                    placeholderTextColor="#64748b" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry={!showPassword} 
                    style={styles.input} 
                    onFocus={() => setPassFocused(true)} 
                    onBlur={() => setPassFocused(false)} 
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotPass} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassText}>{t("LoginScreen.Forgot_Password", { defaultValue: 'Forgot password?' })}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButtonWrapper, loading && styles.loginButtonLoading]} 
                onPress={handleLogin} 
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient 
                  colors={Theme.gradients.primary} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>{loading ? 'Authenticating...' : t("LoginScreen.Login", { defaultValue: 'Sign In' })}</Text>
                  {!loading && <ArrowRight size={20} color="#ffffff" />}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{t("LoginScreen.Don_t_have_an_account", { defaultValue: "Don't have an account? " })}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.signupText}>{t("LoginScreen.Sign_Up", { defaultValue: 'Sign up' })}</Text>
                </TouchableOpacity>
              </View>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPassText: {
    color: '#10b981',
    fontSize: 14,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
  loginButtonWrapper: {
    borderRadius: 20,
    marginBottom: 32,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonLoading: {
    opacity: 0.7,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.heading,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.body,
  },
  signupText: {
    color: '#10b981',
    fontSize: 15,
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
  },
});