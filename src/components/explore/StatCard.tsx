/**
 * StatCard Component - GalliGo React Native
 *
 * Displays a statistic with icon and label
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H2, Caption } from '@/components/ui';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

export interface StatCardProps {
  /**
   * Icon name
   */
  icon: keyof typeof Ionicons.glyphMap;

  /**
   * Statistic value
   */
  value: number;

  /**
   * Label text
   */
  label: string;

  /**
   * Icon color
   */
  color?: string;
}

export function StatCard({
  icon,
  value,
  label,
  color = colors.primary.blue,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <H2 style={styles.value}>{value.toLocaleString()}</H2>
      <Caption color={colors.neutral[600]}>{label}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  value: {
    marginBottom: spacing[1],
  },
});
