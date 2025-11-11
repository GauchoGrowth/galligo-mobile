/**
 * TravelStatistics Component
 *
 * Displays statistics cards for cities, places, and favorites
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BodySmall, H2 } from '@/components/ui';
import { AnimatedStatsCounter } from './AnimatedStatsCounter';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

interface TravelStatisticsProps {
  citiesCount: number;
  placesCount: number;
  favoritesCount: number;
}

export function TravelStatistics({ citiesCount, placesCount, favoritesCount }: TravelStatisticsProps) {
  return (
    <View style={styles.container}>
      <StatCard value={citiesCount} label="Cities" />
      <StatCard value={placesCount} label="Places" />
      <StatCard value={favoritesCount} label="Favorites" />
    </View>
  );
}

interface StatCardProps {
  value: number;
  label: string;
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <View style={styles.card}>
      <AnimatedStatsCounter
        value={value}
        duration={300}
        style={styles.statNumber}
      />
      <BodySmall color={colors.neutral[600]} align="center" style={styles.label}>
        {label}
      </BodySmall>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[4],
  },
  card: {
    flex: 1,
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statNumber: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 40,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  label: {
    marginTop: spacing[1],
  },
});
