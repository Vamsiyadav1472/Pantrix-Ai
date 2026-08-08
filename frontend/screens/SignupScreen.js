import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, TextInput, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { authService } from '../services/api';
import Button from '../components/Button';
import { Theme } from '../theme';

const SignupScreen = ({
  navigation
}) => {
  const {
    t
  } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);

  // Validation functions
  const validateFullName = name => name.trim().length >= 3;
  const validateEmail = email => {
    const re = /^[^\s@]+@[^\s@]+\.com$/i;
    return re.test(email.trim());
  };
  const getPasswordStrength = pass => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const handleSignup = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    if (!validateFullName(trimmedName)) {
      Alert.alert("Invalid Name", "Full Name must be at least 3 characters.");
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "enter a valid email id");
      return;
    }
    const strength = getPasswordStrength(password);
    if (strength < 5) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.");
      return;
    }
    if (!confirmPassword || password !== confirmPassword) {
      Alert.alert("Password Error", "Password and Re-enter Password do not match! Please make sure both passwords are the same.");
      return;
    }
    setLoading(true);
    try {
      const userData = {
        username: trimmedEmail.split('@')[0],
        email: trimmedEmail,
        password: password,
        full_name: trimmedName
      };
      const response = await authService.register(userData);
      setLoading(false);
      // Navigate to OTP verification instead of Main
      navigation.navigate('EmailVerification', {
        email: trimmedEmail
      });
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.detail || "Registration failed.";
      Alert.alert("Sign Up Error", message);
    }
  };
  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const mockGoogleData = {
        idToken: "mock_token_" + Date.now(),
        email: "google.user@gmail.com",
        name: "Google User",
        photoUrl: "https://ui-avatars.com/api/?name=Google+User&background=4CAF50&color=fff",
        googleId: "google_1234567890"
      };
      const response = await authService.googleLogin(mockGoogleData);
      if (response.data && response.data.user_id) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        setLoading(false);
        Alert.alert("Success", "Successfully signed in with Google!");
        navigation.replace('Main');
      }
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.detail || error.message || "An error occurred during Google sign in.";
      Alert.alert("Google Login Failed", message);
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
            <View style={styles.logoWrap}>
              <View style={styles.logoCircle}>
                <UserPlus size={32} color="#000000" strokeWidth={2} />
              </View>
            </View>
            <Text style={styles.heroTitle}>{t("SignupScreen.Create_Account")}</Text>
            <Text style={styles.heroSubtitle}>{t("SignupScreen.Start_tracking_your_smart_pant")}</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formCard}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("SignupScreen.Full_Name")}</Text>
              <View style={[styles.inputWrapper, nameFocused && styles.inputFocused]}>
                <User size={18} color={nameFocused ? Theme.colors.primary : Theme.colors.textLight} />
                <TextInput placeholder={t("SignupScreen.placeholder_Enter_your_full_name")} placeholderTextColor={Theme.colors.textPlaceholder} value={fullName} onChangeText={setFullName} style={styles.input} onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)} />
              </View>
              {fullName.length > 0 && !validateFullName(fullName) && <Text style={styles.validationText}>{t("SignupScreen.Minimum_3_characters_required")}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("SignupScreen.Email_Address")}</Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
                <Mail size={18} color={emailFocused ? Theme.colors.primary : Theme.colors.textLight} />
                <TextInput placeholder={t("SignupScreen.placeholder_Enter_your_email")} placeholderTextColor={Theme.colors.textPlaceholder} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} />
              </View>
              {email.length > 0 && !validateEmail(email) && <Text style={styles.validationText}>{t("SignupScreen.enter_a_valid_email_id")}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("SignupScreen.Password")}</Text>
              <View style={[styles.inputWrapper, passFocused && styles.inputFocused]}>
                <Lock size={18} color={passFocused ? Theme.colors.primary : Theme.colors.textLight} />
                <TextInput placeholder={t("SignupScreen.placeholder_Create_a_strong_pass")} placeholderTextColor={Theme.colors.textPlaceholder} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} style={styles.input} onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} color={Theme.colors.textLight} /> : <Eye size={18} color={Theme.colors.textLight} />}
                </TouchableOpacity>
              </View>
              {password.length > 0 && <View style={styles.strengthContainer}>
                  <View style={[styles.strengthBar, getPasswordStrength(password) >= 1 && {
                backgroundColor: Theme.colors.danger
              }]} />
                  <View style={[styles.strengthBar, getPasswordStrength(password) >= 3 && {
                backgroundColor: Theme.colors.warning
              }]} />
                  <View style={[styles.strengthBar, getPasswordStrength(password) >= 4 && {
                backgroundColor: Theme.colors.primaryMid
              }]} />
                  <View style={[styles.strengthBar, getPasswordStrength(password) >= 5 && {
                backgroundColor: Theme.colors.primary
              }]} />
                </View>}
              {password.length > 0 && getPasswordStrength(password) < 5 && <Text style={styles.validationText}>{t("SignupScreen.Needs_8_chars_upper_lower")}</Text>}
            </View>

            {/* Re-enter Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("SignupScreen.Confirm_Password", "Re-enter Password")}</Text>
              <View style={[styles.inputWrapper, confirmPassFocused && styles.inputFocused]}>
                <Lock size={18} color={confirmPassFocused ? Theme.colors.primary : Theme.colors.textLight} />
                <TextInput placeholder={t("SignupScreen.placeholder_Re_enter_password", "Re-enter your password")} placeholderTextColor={Theme.colors.textPlaceholder} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} style={styles.input} onFocus={() => setConfirmPassFocused(true)} onBlur={() => setConfirmPassFocused(false)} />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} color={Theme.colors.textLight} /> : <Eye size={18} color={Theme.colors.textLight} />}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && <Text style={styles.validationText}>{t("SignupScreen.Passwords_do_not_match", "Passwords do not match")}</Text>}
            </View>

            {/* Signup Button */}
            <Button title={loading ? "Creating Account..." : "Create Account"} onPress={handleSignup} loading={loading} variant="primary" size="lg" style={styles.primaryButton} />


            {/* Login Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("SignupScreen.Already_have_an_account")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>{t("SignupScreen.Login")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>;
};
export default SignupScreen;
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
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 28,
    alignItems: 'center'
  },
  logoWrap: {
    marginBottom: 14
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    color: '#ffffff',
    letterSpacing: -0.3,
    textAlign: 'center'
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
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
    marginBottom: 16
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
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Theme.colors.text
  },
  primaryButton: {
    marginTop: 10,
    marginBottom: 20
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border
  },
  dividerText: {
    color: Theme.colors.textLight,
    fontSize: 13,
    fontFamily: 'Inter_400Regular'
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.card,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  googleIcon: {
    width: 22,
    height: 22
  },
  googleButtonText: {
    color: Theme.colors.text,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerText: {
    color: Theme.colors.textMuted,
    fontSize: 15,
    fontFamily: 'Inter_400Regular'
  },
  loginText: {
    color: Theme.colors.primary,
    fontSize: 15,
    fontFamily: 'Outfit_700Bold'
  },
  validationText: {
    color: Theme.colors.danger,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 6,
    marginLeft: 4
  },
  strengthContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    marginBottom: 4
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.border
  }
});