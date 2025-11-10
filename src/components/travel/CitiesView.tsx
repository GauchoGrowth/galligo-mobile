/**
 * CitiesView Component - GalliGo React Native
 *
 * Grid of city hero cards with images
 */

import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
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

  const renderCityCard = ({ item }: { item: CityData }) => (
    <CityHeroCard
      city={item.name}
      country={item.country}
      countryCode={item.countryCode}
      placeCount={item.placeCount}
      onPress={() => onCityClick(item.name)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Body color={colors.neutral[600]}>No cities yet</Body>
    </View>
  );

  return (
    <FlatList
      data={citiesArray}
      renderItem={renderCityCard}
      keyExtractor={(item) => item.name}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={8}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingBottom: spacing[6],
  },
  emptyContainer: {
    paddingVertical: spacing[12],
    alignItems: 'center',
  },
});
