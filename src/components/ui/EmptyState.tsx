/**
 * EmptyState Component - GalliGo React Native
 *
 * Reusable empty state for when there's no data
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H2, Body, Button } from '@/components/ui';
import { theme } from '@/theme';

const { colors, spacing } = theme;

export interface EmptyStateProps {
  /**
   * Icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;

  /**
   * Title text
   */
  title?: string;

  /**
   * Description text
   */
  description: string;

  /**
   * Optional action button
   */
  actionLabel?: string;

  /**
   * Action button callback
   */
  onAction?: () => void;

  /**
   * Additional styles
   */
  style?: ViewStyle;
}

export function EmptyState({
  icon = 'cube-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={64} color={colors.neutral[300]} />

      {title && (
        <H2 style={styles.title} color={colors.neutral[700]}>
          {title}
        </H2>
      )}

      <Body align="center" color={colors.neutral[600]} style={styles.description}>
        {description}
      </Body>

      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[6],
  },
  title: {
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  description: {
    maxWidth: 300,
  },
  button: {
    marginTop: spacing[6],
  },
});
