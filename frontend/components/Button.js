import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isGradient = variant === 'primary' || variant === 'gradient';
  const isDanger = variant === 'danger';

  const buttonStyles = [
    styles.base,
    styles[size],
    !isGradient && styles[variant],
    disabled && styles.disabled,
  ];

  const labelStyles = [
    styles.textBase,
    styles[`text_${size}`],
    isOutline && styles.text_outline,
    isGhost && styles.text_ghost,
    textStyle,
  ];

  const gradColors = isDanger
    ? Theme.gradients.danger
    : variant === 'secondary'
    ? [Theme.colors.secondary, Theme.colors.secondaryDark]
    : Theme.gradients.primary;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={isOutline || isGhost ? Theme.colors.primary : Theme.colors.white}
          size="small"
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[labelStyles, !(isOutline || isGhost) && styles.text_solid]}>{title}</Text>
        </>
      )}
    </>
  );

  if (isGradient || isDanger || variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.gradientWrapper, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={gradColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientInner, styles[`padding_${size}`]]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[buttonStyles, style]}
      activeOpacity={0.82}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Theme.borderRadius.xl,
    gap: 8,
  },
  gradientWrapper: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    ...Theme.shadows.md,
  },
  gradientInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.xl,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: Theme.borderRadius.xl,
  },
  sm: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  'padding_sm': {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  'padding_md': {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  'padding_lg': {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: 2,
  },
  textBase: {
    fontFamily: Theme.typography.fontFamily.bodySemiBold,
    fontWeight: '700',
    textAlign: 'center',
  },
  text_solid: {
    color: Theme.colors.white,
  },
  text_outline: {
    color: Theme.colors.primary,
  },
  text_ghost: {
    color: Theme.colors.primary,
  },
  text_sm: { fontSize: 14 },
  text_md: { fontSize: 16 },
  text_lg: { fontSize: 18 },
});

export default Button;
