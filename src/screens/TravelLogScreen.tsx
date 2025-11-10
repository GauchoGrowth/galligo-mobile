/**
 * Travel Log Screen - GalliGo React Native
 *
 * Complete redesign matching web app with:
 * - Three tabs: Travel Footprint, Journal, Milestones
 * - Interactive world map with visited countries
 * - Country flags filter
 * - Statistics cards
 * - Search functionality
 * - Weekly journal timeline
 * - Milestone tracking
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, RefreshControl, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FullPageSpinner, Body } from '@/components/ui';
import { CitiesView } from '@/components/travel/CitiesView';
import { MapHeader } from '@/components/map/MapHeader';
import { ProfileHeader } from '@/components/travel/ProfileHeader';
import { TravelLogTabs } from '@/components/travel/TravelLogTabs';
import { TravelStatistics } from '@/components/travel/TravelStatistics';
import { CountryFlags } from '@/components/travel/CountryFlags';
import { SearchBar } from '@/components/travel/SearchBar';
import { FilterChip } from '@/components/travel/FilterChip';
import { JournalTimeline } from '@/components/journal/JournalTimeline';
import { MilestonesView } from '@/components/milestones/MilestonesView';
import type { CityData, FriendInCity } from '@/components/travel/CitiesView';
import type { TravelLogTab } from '@/components/travel/TravelLogTabs';
import { usePlaces, useTrips, useHomes, useUserProfile } from '@/lib/api-hooks';
import { getCountryCode } from '@/utils/countryUtils';
import { fetchUserActivities, groupActivitiesByWeek } from '@/services/journalService';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing } = theme;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TravelLogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TravelLogTab>('footprint');

  // Fetch data from API
  const { data: places = [], isLoading: placesLoading, refetch: refetchPlaces } = usePlaces();
  const { data: trips = [], isLoading: tripsLoading, refetch: refetchTrips } = useTrips();
  const { data: homes = [], isLoading: homesLoading, refetch: refetchHomes } = useHomes();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  const isLoading = placesLoading || tripsLoading || homesLoading || profileLoading;

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

  // Get country name from code for filter chip
  const selectedCountryName = useMemo(() => {
    if (!selectedCountry) return null;
    const countryName = Object.keys(require('@/utils/countryUtils').COUNTRY_CODES).find(
      key => require('@/utils/countryUtils').COUNTRY_CODES[key] === selectedCountry
    );
    return countryName || null;
  }, [selectedCountry]);

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

  // Handle country selection
  const handleCountryPress = (countryCode: string) => {
    if (selectedCountry === countryCode) {
      setSelectedCountry(null);
    } else {
      setSelectedCountry(countryCode);
    }
  };

  // Loading state
  if (isLoading) {
    return <FullPageSpinner label="Loading your travels..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={{ width: 40 }} />
        <Body weight="semibold" style={styles.headerTitle}>
          Travel Log
        </Body>
        <Pressable
          onPress={() => navigation.navigate('UserProfile')}
          hitSlop={8}
          style={styles.profileButton}
        >
          <Ionicons name="person-circle-outline" size={32} color={colors.neutral[700]} />
        </Pressable>
      </View>

      {/* Map Header - Always visible */}
      <MapHeader
        visitedCountries={visitedCountryCodes}
        selectedCountry={selectedCountry}
        onCountryPress={handleCountryPress}
        height={200}
      />

      {/* Profile Header */}
      <ProfileHeader
        displayName={displayName}
        avatarUrl={profile?.avatar_url}
        friendCount={0}
        onLogoutPress={() => navigation.navigate('UserProfile')}
      />

      {/* Tab Navigation */}
      <TravelLogTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary.blue} />
        }
      >
        {/* Travel Footprint Tab */}
        {activeTab === 'footprint' && (
          <View>
            {/* Country Flags */}
            {visitedCountryCodes.length > 0 && (
              <CountryFlags
                countryCodes={visitedCountryCodes}
                selectedCountryCode={selectedCountry}
                onFlagPress={handleCountryPress}
                size="md"
              />
            )}

            {/* Filter Chip */}
            {selectedCountryName && (
              <FilterChip
                label={`Showing: ${selectedCountryName}`}
                onDismiss={() => setSelectedCountry(null)}
              />
            )}

            {/* Statistics */}
            <TravelStatistics
              citiesCount={uniqueCities}
              placesCount={uniquePlaces}
              favoritesCount={favoritesCount}
            />

            {/* Search Bar */}
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search cities..." />

            {/* Cities Grid */}
            {citiesMap.size > 0 ? (
              <CitiesView
                cities={citiesMap}
                onCityClick={cityName => {
                  navigation.navigate('CityDetail', { cityName });
                }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Body align="center" color={colors.neutral[600]}>
                  {searchQuery
                    ? 'No cities match your search'
                    : selectedCountryName
                    ? `No cities in ${selectedCountryName}`
                    : 'No places yet. Start adding places to your travel log!'}
                </Body>
              </View>
            )}
          </View>
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && <JournalTimeline weeklySummaries={weeklySummaries} />}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && <MilestonesView milestones={[]} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[2],
    backgroundColor: colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: 16,
  },
  profileButton: {
    padding: spacing[1],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing[8],
  },
  emptyState: {
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[6],
  },
});
