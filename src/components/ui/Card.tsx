/**
 * Card Component - GalliGo Design System
 *
 * iOS-style card with elevation and subtle animations
 */

import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
// Temporarily disabled animations for Expo Go compatibility
// import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { theme, combineStyles } from '@/theme';

const { colors, spacing, borderRadius, shadows, animation } = theme;

// ============================================================================
// TYPES
// ============================================================================

export type CardVariant = 'default' | 'elevated' | 'outline';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;

  /** Visual variant */
  variant?: CardVariant;

  /** Make card pressable */
  pressable?: boolean;

  /** Press handler (only works if pressable=true) */
  onPress?: () => void;

  /** Custom padding */
  padding?: number;

  /** Custom margin */
  margin?: number;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Test ID */
  testID?: string;

  /** Custom style */
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  padding = spacing[6],
  margin,
  accessibilityLabel,
  testID,
  style,
}) => {
  // Combine styles
  const containerStyle = combineStyles(
    styles.base,
    variantStyles[variant],
    { padding, margin },
    style
  );

  // If pressable, wrap in Pressable
  if (pressable) {
    return (
      <Pressable
        style={containerStyle as ViewStyle}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.8 : 1 }}>
            {children}
          </View>
        )}
      </Pressable>
    );
  }

  // Otherwise, render as View
  return (
    <View style={containerStyle as ViewStyle} testID={testID}>
      {children}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary.white,
    overflow: 'hidden',
  },
});

// Variant styles
const variantStyles: Record<CardVariant, ViewStyle> = {
  default: {
    ...shadows[2],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },

  elevated: {
    ...shadows[3],
  },

  outline: {
    borderWidth: 2,
    borderColor: colors.neutral[300],
    ...shadows[0], // No shadow
  },
};
