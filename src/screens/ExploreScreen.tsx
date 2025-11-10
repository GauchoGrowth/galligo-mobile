/**
 * Explore Screen - GalliGo React Native
 *
 * Discover places from your friends network
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FullPageSpinner, SearchBar, EmptyState, H1 } from '@/components/ui';
import { CityCard } from '@/components/travel/CityCard';
import { StatCard } from '@/components/explore/StatCard';
import type { FriendInCity } from '@/components/travel/CityCard';
import { useFriendsNetwork } from '@/lib/api-hooks';
import { getCountryCode } from '@/utils/countryUtils';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing } = theme;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ExploreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch friends network data
  const { data: networkData, isLoading, error, refetch } = useFriendsNetwork();

  // Transform data for display
  const citiesData = useMemo(() => {
    if (!networkData?.cities) return [];

    return networkData.cities.map((cityData) => ({
      city: cityData.city,
      country: cityData.country,
      countryCode: getCountryCode(cityData.country),
      friends: cityData.friends.map((friend) => ({
        name: friend.name,
        avatarUrl: friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${friend.name}`,
        placeCount: friend.placeCount,
        recentPlace: cityData.places.find((p) => p.friendId === friend.userId)?.name,
      })) as FriendInCity[],
      totalPlaces: cityData.totalPlaces,
    }));
  }, [networkData]);

  // Filter cities by search query
  const filteredCities = useMemo(() => {
    if (!searchQuery) return citiesData;

    return citiesData.filter(
      (city) =>
        city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.friends.some((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [citiesData, searchQuery]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Loading state
  if (isLoading) {
    return <FullPageSpinner label="Loading your network..." />;
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <EmptyState
            icon="alert-circle-outline"
            description="Failed to load friends network. Please try again."
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!networkData || networkData.friends.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <EmptyState
            icon="people-outline"
            title="No Friends Yet"
            description="Start adding friends to see their travel recommendations!"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.blue}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <H1>Explore</H1>
        </View>

        {/* Network Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="people"
            value={networkData.friends.length}
            label="Friends"
            color={colors.primary.blue}
          />
          <StatCard
            icon="location"
            value={networkData.totalCities}
            label="Cities"
            color="#10b981"
          />
          <StatCard
            icon="restaurant"
            value={networkData.totalPlaces}
            label="Places"
            color="#f59e0b"
          />
        </View>

        {/* Search */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search cities or friends..."
        />

        {/* Cities List */}
        {filteredCities.length === 0 ? (
          <EmptyState
            icon="search-outline"
            description={searchQuery ? 'No cities found' : 'No cities to display'}
          />
        ) : (
          <View style={styles.citiesList}>
            {filteredCities.map((city) => (
              <CityCard
                key={city.city}
                city={city.city}
                country={city.country}
                countryCode={city.countryCode}
                friends={city.friends}
                totalPlaces={city.totalPlaces}
                onViewAll={() => {
                  navigation.navigate('CityDetail', { cityName: city.city });
                }}
                onFriendClick={(friendName) => {
                  console.log('Friend clicked:', friendName);
                  // TODO: Navigate to friend profile (future feature)
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
  header: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing.pagePaddingMobile,
    marginBottom: spacing[4],
  },
  citiesList: {
    paddingHorizontal: spacing.pagePaddingMobile,
    marginTop: spacing[4],
  },
});
