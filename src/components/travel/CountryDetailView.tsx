/**
 * CountryDetailView Component
 *
 * Full-screen scrollable view for country detail with:
 * - CountryHero at top with parallax
 * - Cities grid below (from CitiesView component)
 * - BackButton overlaid
 * - Entrance animation (slides up from bottom)
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withDelay,
  SharedValue,
} from 'react-native-reanimated';
import { CountryHero } from '@/components/travel/CountryHero';
import { BackButton } from '@/components/travel/BackButton';
import { TravelStatistics } from '@/components/travel/TravelStatistics';
import { SearchBar } from '@/components/travel/SearchBar';
import { CitiesView } from '@/components/travel/CitiesView';
import type { CityData } from '@/components/travel/CitiesView';
import { Body } from '@/components/ui';
import { theme } from '@/theme';
import { ANIMATION_DURATIONS, EASINGS, getStaggerDelay } from '@/lib/animations/constants';

const { colors, spacing } = theme;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface CountryDetailViewProps {
  /**
   * Country code (e.g., "ar")
   */
  countryCode: string;

  /**
   * Country name (e.g., "Argentina")
   */
  countryName: string;

  /**
   * Cities in this country
   */
  cities: Map<string, CityData>;

  /**
   * Search query for filtering cities
   */
  searchQuery: string;

  /**
   * Callback when search query changes
   */
  onSearchChange: (query: string) => void;

  /**
   * Callback when back button is pressed
   */
  onBack: () => void;

  /**
   * Callback when city is clicked
   */
  onCityClick: (cityName: string) => void;

  /**
   * Transition progress (0 = world, 1 = country)
   */
  transitionProgress?: SharedValue<number>;

  /**
   * Animate entrance (default: true)
   */
  animateEntrance?: boolean;

  /**
   * Number of homes in this country
   */
  homesCount?: number;

  /**
   * Number of trips in this country
   */
  tripsCount?: number;

  /**
   * Array of home city names
   */
  homeCities?: string[];

  /**
   * Array of trip city names
   */
  tripCities?: string[];
}

export function CountryDetailView({
  countryCode,
  countryName,
  cities,
  searchQuery,
  onSearchChange,
  onBack,
  onCityClick,
  transitionProgress,
  animateEntrance = true,
  homesCount = 0,
  tripsCount = 0,
  homeCities = [],
  tripCities = [],
}: CountryDetailViewProps) {
  // Scroll position for parallax
  const scrollY = useSharedValue(0);

  // Entrance animation: slide up from bottom
  const translateY = useSharedValue(animateEntrance ? SCREEN_HEIGHT : 0);
  const opacity = useSharedValue(animateEntrance ? 0 : 1);

  useEffect(() => {
    if (!animateEntrance) return;

    // Delay entrance slightly (200ms after map zoom starts)
    translateY.value = withDelay(
      200,
      withTiming(0, {
        duration: ANIMATION_DURATIONS.HERO_ENTRANCE,
        easing: EASINGS.EASE_OUT_EXPO,
      })
    );

    opacity.value = withDelay(
      200,
      withTiming(1, {
        duration: ANIMATION_DURATIONS.HERO_ENTRANCE,
        easing: EASINGS.EASE_OUT_EXPO,
      })
    );
  }, [animateEntrance]);

  // Animated container style
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  // Scroll handler for parallax
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Compute statistics
  const citiesCount = cities.size;
  const placesCount = useMemo(() => {
    let total = 0;
    cities.forEach((city) => {
      total += city.placeCount;
    });
    return total;
  }, [cities]);

  // Filter cities by search query
  const filteredCities = useMemo(() => {
    if (!searchQuery) return cities;

    const filtered = new Map<string, CityData>();
    cities.forEach((city, name) => {
      if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
        filtered.set(name, city);
      }
    });
    return filtered;
  }, [cities, searchQuery]);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Back Button (overlaid) */}
      <BackButton onPress={onBack} animateEntrance={animateEntrance} />

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16} // 60 FPS
      >
        {/* Hero Section with Parallax */}
        <CountryHero
          countryName={countryName}
          countryCode={countryCode}
          citiesCount={citiesCount}
          placesCount={placesCount}
          homesCount={homesCount}
          tripsCount={tripsCount}
          homeCities={homeCities}
          tripCities={tripCities}
          onHomeTap={() => {
            // TODO: Implement navigation to homes or highlight home cities
            console.log('Home stat tapped:', homeCities);
          }}
          onTripTap={() => {
            // TODO: Implement navigation to trips or highlight trip locations
            console.log('Trip stat tapped:', tripCities);
          }}
          scrollY={scrollY}
        />

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Statistics */}
          <TravelStatistics
            citiesCount={citiesCount}
            placesCount={placesCount}
            favoritesCount={0} // TODO: Implement favorites filtering
          />

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder={`Search cities in ${countryName}...`}
          />

          {/* Cities Grid with Staggered Reveal */}
          {filteredCities.size > 0 ? (
            <CitiesView cities={filteredCities} onCityClick={onCityClick} />
          ) : (
            <View style={styles.emptyState}>
              <Body align="center" color={colors.neutral[600]}>
                {searchQuery
                  ? 'No cities match your search'
                  : `No cities in ${countryName}`}
              </Body>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  contentContainer: {
    backgroundColor: colors.neutral[50],
  },
  emptyState: {
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[6],
  },
});
