/**
 * StatCard Component - GalliGo React Native
 *
 * Displays a statistic with icon and label
 * Revamped to match the modern, clean Travel Log aesthetic
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BodySmall } from '@/components/ui';
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
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      
      <Animated.Text style={[styles.value, { color }]}>
        {value.toLocaleString()}
      </Animated.Text>
      
      <BodySmall 
        weight="medium" 
        color={colors.neutral[500]} 
        style={styles.label}
      >
        {label.toUpperCase()}
      </BodySmall>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    // Soft Shadow
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2,
    lineHeight: 34,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
