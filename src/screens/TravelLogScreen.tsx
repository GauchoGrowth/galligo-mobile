/**
 * Travel Log Screen - GalliGo React Native
 *
 * Complete redesign with animated transitions:
 * - World view → Country detail transitions
 * - Three tabs: Travel Footprint, Journal, Milestones
 * - Interactive world map with visited countries
 * - Cinema-quality animations (60 FPS target)
 * - Smooth state transitions with Reanimated v4
 */

import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FullPageSpinner } from '@/components/ui';
import { WorldView } from '@/components/travel/WorldView';
import type { CityData, FriendInCity } from '@/components/travel/CitiesView';
import type { TravelLogTab } from '@/components/travel/TravelLogTabs';
import { usePlaces, useTrips, useHomes, useUserProfile } from '@/lib/api-hooks';
import { getCountryCode } from '@/utils/countryUtils';
import { fetchUserActivities, groupActivitiesByWeek } from '@/services/journalService';
import {
  getTripsByCountry,
  getHomesByCountry,
  getHomeCitiesForCountry,
  getTripLocationsForCountry,
} from '@/lib/travel-data-utils';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors } = theme;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TravelLogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TravelLogTab>('footprint');

  // Fetch data from API
  const { data: places = [], isLoading: placesLoading, error: placesError, refetch: refetchPlaces } = usePlaces();
  const { data: trips = [], isLoading: tripsLoading, error: tripsError, refetch: refetchTrips } = useTrips();
  const { data: homes = [], isLoading: homesLoading, error: homesError, refetch: refetchHomes } = useHomes();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();

  const hasError = Boolean(placesError || tripsError || homesError || profileError);
  const isLoading = !hasError && (placesLoading || tripsLoading || homesLoading || profileLoading);

  console.log('[TravelLogScreen] loading state', {
    placesLoading,
    tripsLoading,
    homesLoading,
    profileLoading,
    placesError: !!placesError,
    tripsError: !!tripsError,
    homesError: !!homesError,
    profileError: !!profileError,
    isLoading,
  });

  // Filter places by selected country
  const filteredPlaces = useMemo(() => {
    if (!selectedCountry) return places;
    const selectedCountryName = Object.keys(require('@/utils/countryUtils').COUNTRY_CODES).find(
      key => require('@/utils/countryUtils').COUNTRY_CODES[key] === selectedCountry
    );
    if (!selectedCountryName) return places;
    return places.filter(place => place.country === selectedCountryName);
  }, [places, selectedCountry]);

  // Transform places into cities map
  const citiesMap = useMemo(() => {
    const grouped = new Map<string, CityData>();
    const placesToGroup = searchQuery
      ? filteredPlaces.filter(
          place =>
            place.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            place.country.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : filteredPlaces;

    placesToGroup.forEach(place => {
      if (!place.city || !place.country) return;

      const existing = grouped.get(place.city);

      if (existing) {
        existing.placeCount++;
      } else {
        const friends: FriendInCity[] = [
          {
            name: 'You',
            avatarUrl: profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/png?seed=user',
            placeCount: 1,
            recentPlace: place.name,
          },
        ];

        grouped.set(place.city, {
          name: place.city,
          country: place.country,
          countryCode: getCountryCode(place.country),
          placeCount: 1,
          friends,
        });
      }
    });

    return grouped;
  }, [filteredPlaces, searchQuery, profile]);

  // Compute stats
  const uniqueCities = useMemo(() => citiesMap.size, [citiesMap]);
  const uniquePlaces = useMemo(() => filteredPlaces.length, [filteredPlaces]);
  const favoritesCount = 0; // TODO: Implement favorites count

  // Get visited countries (country codes)
  const visitedCountryCodes = useMemo(() => {
    const countries = new Set(
      places
        .map(p => p.country?.trim())
        .filter(country => country && country.length > 0)
        .map(country => getCountryCode(country))
    );
    return Array.from(countries);
  }, [places]);

  // Global homes and trips stats
  const totalHomesCount = useMemo(() => homes.length, [homes]);
  const totalTripsCount = useMemo(() => trips.length, [trips]);

  // Aggregate by country
  const tripsByCountry = useMemo(
    () => getTripsByCountry(trips),
    [trips]
  );

  const homesByCountry = useMemo(
    () => getHomesByCountry(homes),
    [homes]
  );

  // Current country stats (when country is selected)
  const currentCountryHomes = useMemo(() => {
    if (!selectedCountry) return 0;
    return homesByCountry.get(selectedCountry) || 0;
  }, [selectedCountry, homesByCountry]);

  const currentCountryTrips = useMemo(() => {
    if (!selectedCountry) return 0;
    return tripsByCountry.get(selectedCountry) || 0;
  }, [selectedCountry, tripsByCountry]);

  // Home cities for current country
  const homeCitiesInCountry = useMemo(() => {
    if (!selectedCountry) return [];
    return getHomeCitiesForCountry(homes, selectedCountry);
  }, [selectedCountry, homes]);

  // Trip locations for current country
  const tripLocationsInCountry = useMemo(() => {
    if (!selectedCountry) return [];
    return getTripLocationsForCountry(trips, selectedCountry);
  }, [selectedCountry, trips]);

  // Journal data
  const weeklySummaries = useMemo(() => {
    const activities = fetchUserActivities(places, trips, homes);
    return groupActivitiesByWeek(activities);
  }, [places, trips, homes]);

  // Display name for profile header
  const displayName = useMemo(() => {
    return profile?.display_name || profile?.email?.split('@')[0] || 'Traveler';
  }, [profile]);

  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPlaces(), refetchTrips(), refetchHomes()]);
    setRefreshing(false);
  };

  // Handle country selection - simplified (no page navigation)
  const handleCountryPress = useCallback(
    (countryCode: string | null) => {
      if (!countryCode || selectedCountry === countryCode) {
        setSelectedCountry(null);
      } else {
        console.log('[TravelLogScreen] Country selected:', countryCode);
        setSelectedCountry(countryCode);
      }
    },
    [selectedCountry]
  );

  // Get country name from selected country code
  const selectedCountryName = useMemo(() => {
    if (!selectedCountry) return null;
    const countryName = Object.keys(require('@/utils/countryUtils').COUNTRY_CODES).find(
      key => require('@/utils/countryUtils').COUNTRY_CODES[key] === selectedCountry
    );
    return countryName || null;
  }, [selectedCountry]);

  // Loading state
  if (isLoading) {
    return <FullPageSpinner label="Loading your travels..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WorldView
        visitedCountries={visitedCountryCodes}
        citiesMap={citiesMap}
        citiesCount={uniqueCities}
        placesCount={uniquePlaces}
        favoritesCount={favoritesCount}
        weeklySummaries={weeklySummaries}
        homesCount={totalHomesCount}
        tripsCount={totalTripsCount}
        homeMarkers={homeCitiesInCountry}
        tripMarkers={tripLocationsInCountry}
        displayName={displayName}
        avatarUrl={profile?.avatar_url}
        friendCount={0}
        selectedCountry={selectedCountry}
        searchQuery={searchQuery}
        activeTab={activeTab}
        onCountryPress={handleCountryPress}
        onSearchChange={setSearchQuery}
        onTabChange={setActiveTab}
        onCityClick={(cityName) => navigation.navigate('CityDetail', { cityName })}
        onLogoutPress={() => navigation.navigate('UserProfile')}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
});
