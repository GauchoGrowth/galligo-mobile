/**
 * WorldView Component
 *
 * Composition component for the entire world overview
 * - Includes: AnimatedMapHeader, AnimatedCountryFlags, ProfileHeader, TravelLogTabs
 * - Handles entrance animations on mount
 * - Passes all necessary data down from TravelLogScreen
 * - Revamped layout for a seamless, modern feel
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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
import { TravelLogGlobe } from '@/features/globe/components/TravelLogGlobe';
import { LAYOUT } from '@/lib/animations/constants';

const { colors, spacing, borderRadius } = theme;

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
  onCountryPress: (countryCode: string | null) => void;
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
  // View mode state: global view or country-focused view
  const [viewMode, setViewMode] = useState<'global' | 'country'>('global');

  // Animated values for UI transitions
  const flagOpacity = useSharedValue(1);
  const statsTranslateY = useSharedValue(0);
  const backButtonOpacity = useSharedValue(0);

  // Handle country selection
  const handleCountrySelect = (countryCode: string | null) => {
    if (countryCode) {
      setViewMode('country');
      onCountryPress(countryCode);
    } else {
      setViewMode('global');
      onCountryPress(null);
    }
  };

  // Handle back to global view
  const handleBackToGlobal = () => {
    handleCountrySelect(null);
  };

  // Animate UI elements based on view mode
  useEffect(() => {
    if (viewMode === 'country') {
      // Fade out flags
      flagOpacity.value = withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
      // Stats stay visible (no movement)
      statsTranslateY.value = withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
      // Show back button
      backButtonOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Reverse animations
      flagOpacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
      statsTranslateY.value = withTiming(0, {
        duration: 800,
      });
      backButtonOpacity.value = withTiming(0, {
        duration: 400,
      });
    }
  }, [viewMode, flagOpacity, statsTranslateY, backButtonOpacity]);

  // Animated styles
  const flagAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flagOpacity.value,
    pointerEvents: flagOpacity.value === 0 ? 'none' : 'auto',
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: statsTranslateY.value }],
  }));

  const backButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backButtonOpacity.value,
    pointerEvents: backButtonOpacity.value === 0 ? 'none' : 'auto',
  }));

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
            {/* Back Button - appears when in country view */}
            <Animated.View style={[styles.backButtonContainer, backButtonAnimatedStyle]}>
              <TouchableOpacity onPress={handleBackToGlobal} style={styles.backButton}>
                <Ionicons name="arrow-back" size={16} color={colors.primary.white} />
                <Text style={styles.backButtonText}>World View</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Map/Globe - always visible, handles zoom internally */}
            <View style={styles.mapContainer}>
              <TravelLogGlobe onCountryChange={handleCountrySelect} />
            </View>

            {/* Country Flags - fade out when country selected - MOVED BELOW MAP */}
            {visitedCountries.length > 0 && (
              <Animated.View style={[flagAnimatedStyle, styles.flagsContainer]}>
                <AnimatedCountryFlags
                  countryCodes={visitedCountries}
                  selectedCountryCode={selectedCountry}
                  onFlagPress={code => handleCountrySelect(code)}
                  size="md"
                  animateEntrance={true}
                />
              </Animated.View>
            )}

            {/* Statistics - stay visible, slide in when country selected */}
            <Animated.View style={statsAnimatedStyle}>
              <TravelStatistics
                citiesCount={citiesCount}
                placesCount={placesCount}
                favoritesCount={favoritesCount}
              />
            </Animated.View>
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
    backgroundColor: colors.neutral[50], // Consistent background
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing[16],
  },
  mapContainer: {
    height: LAYOUT.MAP_HEADER_HEIGHT,
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  backButtonContainer: {
    position: 'absolute',
    top: spacing[4],
    left: spacing.pagePaddingMobile,
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.blue,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    gap: spacing[2],
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.white,
  },
  flagsContainer: {
    marginVertical: spacing[2],
  },
});
