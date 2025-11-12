/**
 * MarkerStats Component - React Native
 * Displays aggregated marker statistics for a place
 * Port from web app with iOS design patterns
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MARKER_CONFIG, MARKER_DISPLAY_ORDER } from './markerConfig';
import { theme } from '@/theme';

const { colors, spacing } = theme;

export interface MarkerStats {
  loved: number;
  liked: number;
  hasbeen: number;
  wanttogo: number;
}

interface MarkerStatsProps {
  stats: MarkerStats;
  compact?: boolean;
}

export function MarkerStatsComponent({ stats, compact = false }: MarkerStatsProps) {
  // Filter to only show non-zero stats
  const visibleStats = MARKER_DISPLAY_ORDER.filter(type => stats[type] > 0);

  // Don't render if no stats
  if (visibleStats.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {visibleStats.map((type, index) => {
        const config = MARKER_CONFIG[type];
        const count = stats[type];
        const label = type === 'hasbeen' 
          ? (count === 1 ? 'has been' : 'have been')
          : config.label.toLowerCase().replace(' this', '');

        return (
          <React.Fragment key={type}>
            {index > 0 && <Text style={styles.separator}>•</Text>}
            <View style={styles.statItem}>
              <Ionicons
                name={config.icon}
                size={compact ? 14 : 16}
                color={config.color}
              />
              <Text style={[styles.count, { color: config.color }]}>{count}</Text>
              <Text style={styles.label}>{label}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  containerCompact: {
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  separator: {
    fontSize: 12,
    color: colors.neutral[400],
    marginHorizontal: spacing[2],
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    color: colors.neutral[600],
  },
});
