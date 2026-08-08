import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme';

const Input = ({ label, error, style, leftIcon, rightIcon, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor="#9ca3af"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontSize: 13,
    color: '#10b981',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1.5,
    borderColor: Theme.colors.borderLight,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadows.xs,
  },
  inputFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFFFFF',
    ...Theme.shadows.sm,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 15,
    color: '#000000',
    height: '100%',
  },
  inputError: {
    borderColor: Theme.colors.danger,
    backgroundColor: Theme.colors.dangerLight,
  },
  errorText: {
    fontFamily: Theme.typography.fontFamily.body,
    fontSize: 12,
    color: Theme.colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
