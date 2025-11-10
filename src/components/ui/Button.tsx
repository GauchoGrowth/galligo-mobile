/**
 * Button Component - GalliGo Design System
 *
 * iOS-style button with full state support and Reanimated animations
 * Matches web button component behavior
 */

import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
// Temporarily disabled animations for Expo Go compatibility
// import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { theme, combineStyles } from '@/theme';

const { colors, spacing, borderRadius, shadows, typography, animation } = theme;

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button text */
  children: string;

  /** Visual variant */
  variant?: ButtonVariant;

  /** Size variant */
  size?: ButtonSize;

  /** Loading state (shows spinner) */
  isLoading?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Full width button */
  fullWidth?: boolean;

  /** Press handler */
  onPress?: () => void;

  /** Accessibility label */
  accessibilityLabel?: string;

  /** Test ID */
  testID?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  accessibilityLabel,
  testID,
}) => {
  // Combine styles
  const containerStyle = combineStyles(
    styles.base,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && styles.fullWidth,
    (disabled || isLoading) && styles.disabled,
    (disabled || isLoading) && disabledVariantStyles[variant]
  );

  const textStyleCombined = combineStyles(
    styles.text,
    variantTextStyles[variant],
    sizeTextStyles[size],
    (disabled || isLoading) && styles.textDisabled
  );

  return (
    <Pressable
      style={[containerStyle as ViewStyle, fullWidth && { width: '100%' }]}
      onPress={onPress}
      disabled={disabled || isLoading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
      testID={testID}
    >
      {({ pressed }) => (
        <>
          {isLoading ? (
            <ActivityIndicator
              color={variant === 'primary' ? colors.primary.white : colors.primary.blue}
              size="small"
            />
          ) : (
            <Text style={[textStyleCombined as TextStyle, pressed && { opacity: 0.7 }]}>
              {children}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
  },

  fullWidth: {
    width: '100%',
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
  },

  textDisabled: {
    opacity: 0.6,
  },
});

// Variant styles
const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary.blue,
    ...shadows.galliBlue,
  },

  secondary: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  destructive: {
    backgroundColor: colors.error,
    ...shadows.error,
  },
};

// Disabled variant styles
const disabledVariantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.neutral[200],
    shadowOpacity: 0,
    elevation: 0,
  },

  secondary: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  destructive: {
    backgroundColor: colors.neutral[300],
    shadowOpacity: 0,
    elevation: 0,
  },
};

// Size styles
const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    minHeight: spacing.touchMin,     // 44px - iOS minimum
    paddingHorizontal: spacing[4],   // 16px
    paddingVertical: spacing[2],     // 8px
  },

  md: {
    minHeight: spacing.touchPreferred, // 48px - Preferred
    paddingHorizontal: spacing[6],     // 24px
    paddingVertical: spacing[3],       // 12px
  },

  lg: {
    minHeight: 56,                     // 56px - Large
    paddingHorizontal: spacing[8],     // 32px
    paddingVertical: spacing[4],       // 16px
  },
};

// Text variant styles
const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: colors.primary.white,
  },

  secondary: {
    color: colors.primary.black,
  },

  ghost: {
    color: colors.primary.blue,
  },

  destructive: {
    color: colors.primary.white,
  },
};

// Text size styles
const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  sm: {
    fontSize: typography.fontSize.bodySm,    // 14px
    lineHeight: typography.lineHeight.bodySm, // 20px
  },

  md: {
    fontSize: typography.fontSize.body,      // 16px
    lineHeight: typography.lineHeight.body,   // 24px
  },

  lg: {
    fontSize: typography.fontSize.bodyLg,    // 18px
    lineHeight: typography.lineHeight.bodyLg, // 28px
  },
};
