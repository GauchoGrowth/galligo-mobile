/**
 * GlobalTravelStats Component
 *
 * Displays global travel statistics (homes and trips count)
 * - Shows total homes and trips across all countries
 * - Uses AnimatedStatsCounter for smooth number morphing
 * - Compact horizontal layout: "🏠 12 Homes • 🧳 18 Trips"
 * - Positioned between map and country flags
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AnimatedStatsCounter } from './AnimatedStatsCounter';
import { theme } from '@/theme';

const { colors, spacing } = theme;

export interface GlobalTravelStatsProps {
  homesCount: number;
  tripsCount: number;
}

/**
 * GlobalTravelStats
 *
 * Compact stats display for global home/trip counts
 * Numbers animate smoothly when values change
 * Shows even when counts are 0 (empty state)
 */
export function GlobalTravelStats({ homesCount, tripsCount }: GlobalTravelStatsProps) {
  // Always show, even if counts are 0 (empty state)
  // This provides a consistent UI and encourages users to add homes/trips

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        {/* Homes stat */}
        <View style={styles.statItem}>
          <Text style={styles.emoji}>🏠</Text>
          <AnimatedStatsCounter
            value={homesCount}
            duration={300}
            style={styles.statNumber}
            suffix={homesCount === 1 ? ' Home' : ' Homes'}
          />
        </View>

        {/* Separator */}
        <Text style={styles.separator}>•</Text>

        {/* Trips stat */}
        <View style={styles.statItem}>
          <Text style={styles.emoji}>🧳</Text>
          <AnimatedStatsCounter
            value={tripsCount}
            duration={300}
            style={styles.statNumber}
            suffix={tripsCount === 1 ? ' Trip' : ' Trips'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  emoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  statNumber: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.neutral[700],
    fontWeight: '500',
  },
  separator: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.neutral[400],
    marginHorizontal: spacing[2],
  },
});
