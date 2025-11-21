/**
 * Explore Screen - GalliGo React Native
 *
 * Discover places from your friends network
 * Revamped for a modern, clean, and airy aesthetic
 */

import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, AccessibilityInfo, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar, EmptyState, H1, Body } from '@/components/ui';
import { CityCard } from '@/components/travel/CityCard';
import { StatCard } from '@/components/explore/StatCard';
import type { FriendInCity } from '@/components/travel/CityCard';
import { useFriendsNetwork } from '@/lib/api-hooks';
import { getCountryCode } from '@/utils/countryUtils';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { colors, spacing, borderRadius } = theme;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ----------------------------------------------------------------------------
// Skeleton Loader Component
// ----------------------------------------------------------------------------
function ExploreSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Stats Skeleton */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.skeletonStat} />
        ))}
      </View>
      {/* Search Skeleton */}
      <View style={styles.skeletonSearch} />
      {/* Cards Skeleton */}
      {[1, 2].map((i) => (
        <View key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );
}

// ----------------------------------------------------------------------------
// Main Screen Component
// ----------------------------------------------------------------------------
export function ExploreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Accessibility announcement for search results
  useEffect(() => {
    if (searchQuery) {
      const message = filteredCities.length === 0 
        ? 'No cities found' 
        : `Found ${filteredCities.length} ${filteredCities.length === 1 ? 'city' : 'cities'}`;
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [filteredCities.length, searchQuery]);

  // Pull to refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Render Header (Clean + Stats + Search)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={[styles.headerContent, { paddingTop: insets.top }]}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <H1 style={styles.pageTitle}>Explore</H1>
          <Body style={styles.subtitle}>See where your friends are traveling</Body>
        </Animated.View>
      </View>

      <View style={styles.contentContainer}>
        {/* Stats Row */}
        {networkData && (
          <View style={styles.statsRow}>
            <StatCard
              icon="people-outline"
              value={networkData.friends.length}
              label="Friends"
              color={colors.primary.blue}
              index={0}
            />
            <StatCard
              icon="map-outline"
              value={networkData.totalCities}
              label="Cities"
              color={colors.secondary.green}
              index={1}
            />
            <StatCard
              icon="location-outline"
              value={networkData.totalPlaces}
              label="Places"
              color={colors.brand.sunset}
              index={2}
            />
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={(text) => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setSearchQuery(text);
            }}
            placeholder="Search cities, friends..."
          />
        </View>
      </View>
    </View>
  );

  // Error State
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
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

  return (
    <View style={styles.container}>
      {isLoading ? (
        <>
          <View style={[styles.headerContent, { paddingTop: insets.top, paddingBottom: spacing[4] }]}>
            <H1 style={styles.pageTitle}>Explore</H1>
            <Body style={styles.subtitle}>See where your friends are traveling</Body>
          </View>
          <ExploreSkeleton />
        </>
      ) : (
        <Animated.FlatList
          data={filteredCities}
          keyExtractor={(item) => item.city}
          contentContainerStyle={{ paddingBottom: spacing[8] }}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={searchQuery ? "search-outline" : "people-outline"}
                title={searchQuery ? "No matches found" : "No cities yet"}
                description={
                  searchQuery 
                    ? `We couldn't find any cities or friends matching "${searchQuery}".` 
                    : "Connect with friends to see their travel discoveries!"
                }
              />
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.cardWrapper}>
              <CityCard
                city={item.city}
                country={item.country}
                countryCode={item.countryCode}
                friends={item.friends}
                totalPlaces={item.totalPlaces}
                index={index}
                onViewAll={() => navigation.navigate('CityDetail', { cityName: item.city })}
              />
            </View>
          )}
          itemLayoutAnimation={Layout.springify()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: spacing[2],
  },
  headerContent: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingBottom: spacing[4],
    backgroundColor: colors.neutral[50],
  },
  pageTitle: {
    fontSize: 34,
    marginBottom: spacing[1],
  },
  subtitle: {
    color: colors.neutral[500],
    fontSize: 16,
  },
  contentContainer: {
    paddingHorizontal: spacing.pagePaddingMobile,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  searchContainer: {
    marginBottom: spacing[6],
  },
  cardWrapper: {
    paddingHorizontal: spacing.pagePaddingMobile,
  },
  emptyContainer: {
    marginTop: spacing[8],
    paddingHorizontal: spacing.pagePaddingMobile,
  },
  // Skeleton Styles
  skeletonContainer: {
    paddingHorizontal: spacing.pagePaddingMobile,
    marginTop: spacing[2],
  },
  skeletonStat: {
    flex: 1,
    height: 100,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.xl,
    marginRight: spacing[2],
  },
  skeletonSearch: {
    height: 48,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  skeletonCard: {
    height: 280,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[4],
  },
});
