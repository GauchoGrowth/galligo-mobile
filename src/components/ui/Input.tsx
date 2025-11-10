/**
 * Input Component - GalliGo Design System
 *
 * Text input with full state support
 */

import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { theme, combineStyles } from '@/theme';

const { colors, spacing, borderRadius, typography } = theme;

// ============================================================================
// TYPES
// ============================================================================

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;

  /** Error message */
  error?: string;

  /** Success state */
  success?: boolean;

  /** Custom container style */
  containerStyle?: ViewStyle;

  /** Custom input style */
  inputStyle?: TextStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  containerStyle,
  inputStyle,
  ...textInputProps
}) => {
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <TextInput
        {...textInputProps}
        style={combineStyles(
          styles.input,
          hasError && styles.inputError,
          success && styles.inputSuccess,
          inputStyle
        ) as TextStyle}
        placeholderTextColor={colors.neutral[400]}
      />

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  label: {
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary.black,
    marginBottom: spacing[2],
  },

  input: {
    minHeight: spacing.touchPreferred, // 48px
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    fontSize: typography.fontSize.body,
    color: colors.primary.black,
    backgroundColor: colors.primary.white,
  },

  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },

  inputSuccess: {
    borderColor: colors.success,
  },

  errorText: {
    fontSize: typography.fontSize.caption,
    color: colors.error,
    marginTop: spacing[1],
  },
});
