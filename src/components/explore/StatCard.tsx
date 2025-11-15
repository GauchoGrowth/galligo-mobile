/**
 * StatCard Component - GalliGo React Native
 *
 * Displays a statistic with icon and label
 * Enhanced with warm brand aesthetic and spring animations
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { H2, Caption } from '@/components/ui';
import { theme } from '@/theme';

const { colors, spacing, borderRadius, shadows } = theme;

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

  /**
   * Index for staggered animation
   */
  index?: number;
}

export function StatCard({
  icon,
  value,
  label,
  color = colors.primary.blue,
  index = 0,
}: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.card}
      accessible={true}
      accessibilityLabel={`${value.toLocaleString()} ${label}`}
      accessibilityRole="summary"
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]} accessible={false}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <H2 style={styles.value} accessibilityElementsHidden={true}>{value.toLocaleString()}</H2>
      <Caption color={colors.text.secondary} accessibilityElementsHidden={true}>{label}</Caption>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.brand.offWhite,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows[1],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  value: {
    marginBottom: spacing[1],
  },
});
