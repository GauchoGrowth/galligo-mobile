/**
 * CitiesView Component - GalliGo React Native
 *
 * List of cities with search functionality using FlatList for performance
 */

import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SearchBar, Body } from '@/components/ui';
import { CityCard, FriendInCity } from './CityCard';
import { theme } from '@/theme';

const { colors, spacing } = theme;

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
  onFriendClick,
}: CitiesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Convert Map to Array and apply search filter
  const filteredCities = useMemo(() => {
    const citiesArray = Array.from(cities.values());

    // Filter out invalid cities
    const validCities = citiesArray.filter(
      (city) =>
        city.name &&
        city.name.trim() !== '' &&
        city.country &&
        city.country.trim() !== ''
    );

    // Apply search filter
    if (searchQuery) {
      return validCities.filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return validCities;
  }, [cities, searchQuery]);

  const renderCityCard = ({ item }: { item: CityData }) => (
    <CityCard
      city={item.name}
      country={item.country}
      countryCode={item.countryCode}
      friends={item.friends}
      totalPlaces={item.placeCount}
      onViewAll={() => onCityClick(item.name)}
      onFriendClick={onFriendClick}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Body weight="semibold" style={styles.headerTitle}>
          Your Cities
        </Body>
        <Body color={colors.neutral[600]}>
          {filteredCities.length} {filteredCities.length === 1 ? 'city' : 'cities'}
        </Body>
      </View>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search cities..."
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Body color={colors.neutral[600]}>
        {searchQuery ? 'No cities found' : 'No cities yet'}
      </Body>
    </View>
  );

  return (
    <FlatList
      data={filteredCities}
      renderItem={renderCityCard}
      keyExtractor={(item) => item.name}
      ListHeaderComponent={renderHeader}
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
  header: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[4],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
  },
  emptyContainer: {
    paddingVertical: spacing[12],
    alignItems: 'center',
  },
});
