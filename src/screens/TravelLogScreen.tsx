/**
 * Travel Log Screen - GalliGo React Native
 *
 * Main screen displaying user's travel footprint with:
 * - World map with visited countries
 * - Cities grouped by friends
 * - Journal timeline
 * - Milestones
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
import type { CityData, FriendInCity } from '@/components/travel/CitiesView';
import { usePlaces } from '@/lib/api-hooks';
import { getCountryCode } from '@/utils/countryUtils';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing, borderRadius } = theme;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function TravelLogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Fetch places data from API
  const { data: places = [], isLoading, refetch } = usePlaces();

  // Transform places into cities map with friend data
  const citiesMap = useMemo(() => {
    const grouped = new Map<string, CityData>();

    places.forEach((place) => {
      // Skip places with invalid city or country
      if (!place.city || !place.country) return;

      const existing = grouped.get(place.city);

      if (existing) {
        existing.placeCount++;
        // In a real app, you'd group by friends who added each place
        // For now, we're using a simplified version
      } else {
        // Create friend entry (simplified - in real app you'd fetch friend data)
        const friends: FriendInCity[] = [{
          name: 'You',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=user',
          placeCount: 1,
          recentPlace: place.name,
        }];

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
  }, [places]);

  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Compute stats for map header
  const uniqueCities = useMemo(() => citiesMap.size, [citiesMap]);
  const uniqueCountries = useMemo(
    () => new Set(places.map((p) => p.country)).size,
    [places]
  );

  // Get list of visited countries (as country codes for map)
  const visitedCountries = useMemo(() => {
    const countries = new Set(
      places
        .map((p) => p.country?.trim())
        .filter((country) => country && country.length > 0)
        .map((country) => getCountryCode(country))
    );
    return Array.from(countries);
  }, [places]);

  // Loading state
  if (isLoading) {
    return <FullPageSpinner label="Loading your travels..." />;
  }

  // Handle country marker press
  const handleCountryPress = (countryCode: string) => {
    if (selectedCountry === countryCode) {
      // Deselect if already selected
      setSelectedCountry(null);
    } else {
      // Select new country
      setSelectedCountry(countryCode);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Profile Button */}
      <View style={styles.topHeader}>
        <View style={{ width: 40 }} />
        <Body weight="semibold" style={styles.headerTitle}>Travel Log</Body>
        <Pressable
          onPress={() => navigation.navigate('UserProfile')}
          hitSlop={8}
          style={styles.profileButton}
        >
          <Ionicons name="person-circle-outline" size={32} color={colors.neutral[700]} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.blue}
          />
        }
      >
        {/* Map Header - Interactive world map with visited countries */}
        <MapHeader
          visitedCountries={visitedCountries}
          selectedCountry={selectedCountry}
          onCountryPress={handleCountryPress}
          height={200}
        />

        {/* Cities View */}
        {citiesMap.size > 0 ? (
          <CitiesView
            cities={citiesMap}
            onCityClick={(cityName) => {
              navigation.navigate('CityDetail', { cityName });
            }}
            onFriendClick={(friendName) => {
              console.log('Friend clicked:', friendName);
              // TODO: Navigate to friend profile (future feature)
            }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Body align="center" color={colors.neutral[600]}>
              No places yet. Start adding places to your travel log!
            </Body>
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
    paddingBottom: spacing[6],
  },
  emptyState: {
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[6],
  },
});
