/**
 * Spinner Component - GalliGo React Native
 *
 * Loading indicator for async operations
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Body } from './Text';
import { theme } from '@/theme';

const { colors, spacing } = theme;

export interface SpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'small' | 'large';

  /**
   * Optional label below spinner
   */
  label?: string;

  /**
   * Color of the spinner
   */
  color?: string;

  /**
   * Center the spinner in container
   */
  centered?: boolean;

  /**
   * Additional styles for container
   */
  style?: ViewStyle;
}

export function Spinner({
  size = 'large',
  label,
  color = colors.primary.blue,
  centered = false,
  style,
}: SpinnerProps) {
  const content = (
    <View style={[styles.container, centered && styles.centered, style]}>
      <ActivityIndicator size={size} color={color} />
      {label && (
        <Body color={colors.neutral[600]} style={styles.label}>
          {label}
        </Body>
      )}
    </View>
  );

  return content;
}

/**
 * Full-screen loading spinner
 * Useful for page-level loading states
 */
export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <View style={styles.fullPage}>
      <Spinner size="large" label={label} centered />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: spacing[2],
    textAlign: 'center',
  },
  fullPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
  },
});
