/**
 * CitiesView Component - GalliGo React Native
 *
 * Grid of city hero cards with images
 * Changed from FlatList to simple View to avoid ScrollView nesting issues
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Body } from '@/components/ui';
import { CityHeroCard } from './CityHeroCard';
import { FriendInCity } from './CityCard';
import { theme } from '@/theme';

const { colors, spacing } = theme;

// Re-export FriendInCity for external use
export type { FriendInCity };

export interface CityData {
  name: string;
  country: string;
  countryCode: string; // e.g., "us", "fr", "mx"
  placeCount: number;
  friends: FriendInCity[];
  heroImage?: string;
  lastVisited?: Date;
}

export interface CitiesViewProps {
  cities: Map<string, CityData>;
  onCityClick: (cityName: string) => void;
  onFriendClick?: (friendName: string) => void;
}

export function CitiesView({
  cities,
  onCityClick,
}: CitiesViewProps) {
  // Convert Map to Array
  const citiesArray = useMemo(() => {
    const arr = Array.from(cities.values());

    // Filter out invalid cities
    return arr.filter(
      (city) =>
        city.name &&
        city.name.trim() !== '' &&
        city.country &&
        city.country.trim() !== ''
    );
  }, [cities]);

  if (citiesArray.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Body color={colors.neutral[600]}>No cities yet</Body>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {citiesArray.map((city) => (
        <CityHeroCard
          key={city.name}
          city={city.name}
          country={city.country}
          countryCode={city.countryCode}
          placeCount={city.placeCount}
          onPress={() => onCityClick(city.name)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.pagePaddingMobile,
  },
  emptyContainer: {
    paddingVertical: spacing[12],
    paddingHorizontal: spacing.pagePaddingMobile,
    alignItems: 'center',
  },
});
