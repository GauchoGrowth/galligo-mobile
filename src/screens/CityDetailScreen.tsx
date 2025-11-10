/**
 * City Detail Screen - GalliGo React Native
 *
 * Shows all places in a specific city with filtering
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FullPageSpinner, EmptyState, H1, H2, Body, PlaceCard } from '@/components/ui';
import { usePlaces } from '@/lib/api-hooks';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'CityDetail'>;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid-outline' as const },
  { id: 'restaurant', label: 'Restaurants', icon: 'restaurant-outline' as const },
  { id: 'coffee', label: 'Coffee', icon: 'cafe-outline' as const },
  { id: 'activity', label: 'Activities', icon: 'bicycle-outline' as const },
  { id: 'hotel', label: 'Hotels', icon: 'bed-outline' as const },
  { id: 'sightseeing', label: 'Sightseeing', icon: 'camera-outline' as const },
];

export function CityDetailScreen({ route, navigation }: Props) {
  const { cityName } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch all places and filter by city
  const { data: allPlaces = [], isLoading } = usePlaces();

  // Filter places for this city
  const cityPlaces = useMemo(() => {
    return allPlaces.filter((place) => place.city === cityName);
  }, [allPlaces, cityName]);

  // Filter by category
  const filteredPlaces = useMemo(() => {
    if (selectedCategory === 'all') return cityPlaces;
    return cityPlaces.filter((place) => place.category === selectedCategory);
  }, [cityPlaces, selectedCategory]);

  // Get city info (country from first place)
  const cityCountry = cityPlaces[0]?.country || '';

  if (isLoading) {
    return <FullPageSpinner label="Loading places..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </Pressable>
        <View style={styles.headerText}>
          <H1>{cityName}</H1>
          {cityCountry && (
            <Body color={colors.neutral[600]}>{cityCountry}</Body>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
        style={styles.categories}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <Pressable
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={isSelected ? colors.primary.blue : colors.neutral[600]}
              />
              <Body
                style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelActive,
                ]}
              >
                {category.label}
              </Body>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Places List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPlaces.length === 0 ? (
          <EmptyState
            icon="location-outline"
            description={
              selectedCategory === 'all'
                ? 'No places in this city yet'
                : `No ${selectedCategory} places found`
            }
          />
        ) : (
          <View style={styles.placesList}>
            <H2 style={styles.sectionTitle}>
              {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'}
            </H2>
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                name={place.name}
                category={place.category}
                city={place.city}
                country={place.country}
                onPress={() => {
                  navigation.navigate('PlaceDetail', { placeId: place.id });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.primary.white,
  },
  backButton: {
    padding: spacing[2],
  },
  headerText: {
    flex: 1,
  },
  categories: {
    backgroundColor: colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  categoriesScroll: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  categoryChipActive: {
    backgroundColor: colors.primary.blue + '15',
    borderColor: colors.primary.blue,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  categoryLabelActive: {
    color: colors.primary.blue,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
  placesList: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingTop: spacing[4],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
});
