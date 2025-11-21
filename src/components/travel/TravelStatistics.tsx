/**
 * TravelStatistics Component
 *
 * Displays statistics cards for cities, places, and favorites
 * Revamped for a cleaner, modern look with shadows and brand colors
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BodySmall } from '@/components/ui';
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
      <StatCard value={citiesCount} label="CITIES" />
      <StatCard value={placesCount} label="PLACES" />
      <StatCard value={favoritesCount} label="FAVORITES" />
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
        duration={600}
        style={styles.statNumber}
      />
      <BodySmall 
        weight="medium" 
        color={colors.neutral[500]} 
        align="center" 
        style={styles.label}
      >
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
    borderRadius: borderRadius.xl, // More rounded
    paddingVertical: spacing[5], // More breathing room
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statNumber: {
    fontSize: 32, // Larger
    fontWeight: '800',
    lineHeight: 36,
    color: colors.primary.blue, // Brand color
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
