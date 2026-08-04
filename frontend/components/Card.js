import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';

const Card = ({ children, style, onPress, variant = 'default', gradientColors, ...props }) => {
  const Container = onPress ? TouchableOpacity : View;

  if (variant === 'gradient' && gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.gradientCard, style]}
        {...props}
      >
        {onPress ? (
          <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.innerTouchable}>
            {children}
          </TouchableOpacity>
        ) : children}
      </LinearGradient>
    );
  }

  return (
    <Container
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'glass' && styles.glass,
        variant === 'premium' && styles.premium,
        variant === 'default' && styles.border,
        variant === 'flat' && styles.flat,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.88}
      {...props}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.md,
    overflow: 'hidden',
  },
  elevated: {
    ...Theme.shadows.md,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    ...Theme.shadows.sm,
  },
  premium: {
    backgroundColor: Theme.colors.card,
    ...Theme.shadows.md,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  border: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  flat: {
    backgroundColor: Theme.colors.backgroundMid,
    borderRadius: Theme.borderRadius.xl,
  },
  gradientCard: {
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    padding: 0,
  },
  innerTouchable: {
    flex: 1,
  },
});

export default Card;
