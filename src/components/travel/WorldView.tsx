/**
 * WorldView Component
 *
 * Composition component for the entire world overview
 * - Includes: AnimatedMapHeader, AnimatedCountryFlags, ProfileHeader, TravelLogTabs
 * - Handles entrance animations on mount
 * - Passes all necessary data down from TravelLogScreen
 */

import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { AnimatedMapHeader } from '@/components/map/AnimatedMapHeader';
import { AnimatedCountryFlags } from '@/components/travel/AnimatedCountryFlags';
import { ProfileHeader } from '@/components/travel/ProfileHeader';
import { TravelLogTabs } from '@/components/travel/TravelLogTabs';
import { TravelStatistics } from '@/components/travel/TravelStatistics';
import { JournalTimeline } from '@/components/journal/JournalTimeline';
import { MilestonesView } from '@/components/milestones/MilestonesView';
import type { CityData } from '@/components/travel/CitiesView';
import type { TravelLogTab } from '@/components/travel/TravelLogTabs';
import type { WeeklySummary } from '@/services/journalService';
import type { LocationMarker } from '@/types/map.types';
import { theme } from '@/theme';
import { LAYOUT } from '@/lib/animations/constants';

const { colors, spacing } = theme;

export interface WorldViewProps {
  // Data
  visitedCountries: string[];
  citiesMap: Map<string, CityData>;
  citiesCount: number;
  placesCount: number;
  favoritesCount: number;
  weeklySummaries: WeeklySummary[];
  homesCount: number;
  tripsCount: number;
  homeMarkers?: LocationMarker[];
  tripMarkers?: LocationMarker[];

  // Profile
  displayName: string;
  avatarUrl?: string;
  friendCount: number;

  // State
  selectedCountry: string | null;
  searchQuery: string;
  activeTab: TravelLogTab;

  // Callbacks
  onCountryPress: (countryCode: string) => void;
  onSearchChange: (query: string) => void;
  onTabChange: (tab: TravelLogTab) => void;
  onCityClick: (cityName: string) => void;
  onLogoutPress: () => void;
  onRefresh?: () => void;

  // Animation
  transitionProgress?: SharedValue<number>;
  refreshing?: boolean;
}

export function WorldView({
  visitedCountries,
  citiesMap,
  citiesCount,
  placesCount,
  favoritesCount,
  weeklySummaries,
  homesCount,
  tripsCount,
  homeMarkers = [],
  tripMarkers = [],
  displayName,
  avatarUrl,
  friendCount,
  selectedCountry,
  searchQuery,
  activeTab,
  onCountryPress,
  onSearchChange,
  onTabChange,
  onCityClick,
  onLogoutPress,
  onRefresh,
  transitionProgress,
  refreshing = false,
}: WorldViewProps) {

  return (
    <View style={styles.container}>
      {/* Fixed Header - Profile Section */}
      <ProfileHeader
        displayName={displayName}
        avatarUrl={avatarUrl}
        friendCount={friendCount}
        onLogoutPress={onLogoutPress}
      />

      {/* Fixed Header - Tab Navigation */}
      <TravelLogTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Tab Content - Scrollable */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.blue} />
          ) : undefined
        }
      >
        {/* Travel Footprint Tab */}
        {activeTab === 'footprint' && (
          <View>
            {/* Country Flags */}
            {visitedCountries.length > 0 && (
              <AnimatedCountryFlags
                countryCodes={visitedCountries}
                selectedCountryCode={selectedCountry}
                onFlagPress={onCountryPress}
                size="md"
                animateEntrance={true}
              />
            )}

            {/* Map/Globe */}
            <AnimatedMapHeader
              visitedCountries={visitedCountries}
              selectedCountry={selectedCountry}
              onCountryPress={onCountryPress}
              height={LAYOUT.MAP_HEADER_HEIGHT}
              transitionProgress={transitionProgress}
              homeMarkers={homeMarkers}
              tripMarkers={tripMarkers}
              showMarkersForCountry={selectedCountry}
            />

            {/* Statistics with animated counters */}
            <TravelStatistics
              citiesCount={citiesCount}
              placesCount={placesCount}
              favoritesCount={favoritesCount}
            />
          </View>
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && <JournalTimeline weeklySummaries={weeklySummaries} />}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && <MilestonesView milestones={[]} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing[8],
  },
});
