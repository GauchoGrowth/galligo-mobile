/**
 * Travel Log Screen - React Three Fiber Implementation
 *
 * Interactive 3D globe with R3F, smooth animations, and country detail panels
 */

import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Image, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedScrollHandler, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { HeroSection } from '@/components/travel/HeroSection';
import { CountryDetailPanel } from '@/components/travel/CountryDetailPanel';
import { useTravelLogGlobeData } from '@/features/globe/hooks/useTravelLogGlobeData';
import { FullPageSpinner } from '@/components/ui';
import { theme } from '@/theme';
import { useTrips, usePlaces, useProfile } from '@/lib/api-hooks';
import { subDays } from 'date-fns';

interface CountryData {
  iso2: string;
  iso3: string;
  name: string;
  status?: 'home' | 'lived' | 'visited' | 'wishlist' | 'friends-only' | 'unseen';
  tripCount?: number;
  placeCount?: number;
}

// ----------------------------------------------------------------------------
// Accessible List View Component
// ----------------------------------------------------------------------------
function VisitedCountriesList({ 
  countries, 
  onSelect 
}: { 
  countries: CountryData[], 
  onSelect: (c: CountryData) => void 
}) {
  return (
    <View style={styles.listContainer}>
      <Text style={styles.listHeader}>Visited Countries ({countries.length})</Text>
      {countries.length === 0 ? (
        <Text style={styles.emptyText}>No visited countries recorded yet.</Text>
      ) : (
        <FlatList
          data={countries.sort((a, b) => a.name.localeCompare(b.name))}
          keyExtractor={(item) => item.iso3}
          scrollEnabled={false} // Parent handles scrolling
          renderItem={({ item }) => (
            <Pressable
              style={styles.listItem}
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${item.name}`}
            >
              <View style={styles.flagPlaceholder}>
                 <Text style={styles.flagText}>{item.iso2.toUpperCase()}</Text>
              </View>
              <Text style={styles.countryName}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

export function TravelLogScreen() {
  const scrollY = useSharedValue(0);
  const [viewMode, setViewMode] = useState<'globe' | 'list'>('globe');
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [orbitReset, setOrbitReset] = useState(0);
  const { data: trips = [] } = useTrips();
  const { data: places = [] } = usePlaces();
  const { data: profile } = useProfile();

  // Fetch travel data
  const { countriesByIso3, isLoading, error } = useTravelLogGlobeData();

  const visitedCountriesIso2 = useMemo(
    () =>
      Object.values(countriesByIso3 || {})
        .filter(c => c.status !== 'unseen')
        .map(c => c.iso2),
    [countriesByIso3]
  );

  const visitedCountriesData = useMemo(
    () => Object.values(countriesByIso3 || {}).filter(c => c.status !== 'unseen'),
    [countriesByIso3]
  );

  // Calculate stats from live data
  const { countriesCount, citiesCount, newThisMonth } = useMemo(() => {
    const visitedCountries = Object.values(countriesByIso3).filter(c => c.status !== 'unseen');
    const uniqueCities = new Set(
      places
        .map(p => `${(p.city || '').trim().toLowerCase()}-${(p.country || '').trim().toLowerCase()}`)
        .filter(Boolean)
    );

    const recentWindow = subDays(new Date(), 30);
    const recentTrips = trips.filter(trip => {
      const start = (trip as any).start_date ?? trip.startDate;
      if (!start) return false;
      return new Date(start) >= recentWindow;
    }).length;
    const recentPlaces = places.filter(place => {
      const created = (place as any).created_at ?? (place as any).createdAt;
      if (!created) return false;
      return new Date(created) >= recentWindow;
    }).length;

    return {
      countriesCount: visitedCountries.length,
      citiesCount: uniqueCities.size || places.length,
      newThisMonth: Math.max(recentTrips + recentPlaces, 1),
    };
  }, [countriesByIso3, places, trips]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleCountrySelect = useCallback((country: CountryData | null) => {
    if (country) {
      setSelectedCountry(country);
      setPanelVisible(true);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelVisible(false);
    setTimeout(() => setSelectedCountry(null), 300);
    // Reset globe view when closing the panel
    setOrbitReset(prev => prev + 1);
  }, []);

  if (isLoading) {
    return <FullPageSpinner label="Loading your travels..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load travel data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Film grain overlay */}
      <View style={styles.filmGrain} pointerEvents="none" />

      {/* Screen Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.kicker}>Mapped beautifully</Text>
          <Text style={styles.title}>Your Travel Log</Text>
          <Text style={styles.subtitle}>Live from your Supabase data</Text>
        </View>
        
        <View style={styles.headerActions}>
          {/* View Mode Toggle */}
          <Pressable
            onPress={() => setViewMode(m => m === 'globe' ? 'list' : 'globe')}
            style={({pressed}) => [styles.iconButton, pressed && styles.iconPressed]}
            accessibilityRole="button"
            accessibilityLabel={viewMode === 'globe' ? "Switch to list view" : "Switch to globe view"}
            hitSlop={8}
          >
            <Ionicons 
              name={viewMode === 'globe' ? "list" : "globe-outline"} 
              size={24} 
              color={theme.colors.primary.blue} 
            />
          </Pressable>

          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: profile?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/png?seed=travel',
              }}
              style={styles.avatar}
              accessibilityLabel="User profile"
            />
            <View style={styles.statusDot} />
          </View>
        </View>
      </View>

      {/* Main content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'globe' ? (
          <HeroSection
            scrollY={scrollY}
            onCountrySelect={handleCountrySelect}
            countriesByIso3={countriesByIso3}
            countriesCount={countriesCount}
            citiesCount={citiesCount}
            newThisMonth={newThisMonth}
            visitedCountriesIso2={visitedCountriesIso2}
            externalReset={orbitReset}
          />
        ) : (
          <Animated.View entering={FadeIn}>
            <VisitedCountriesList 
              countries={visitedCountriesData} 
              onSelect={handleCountrySelect}
            />
             {/* Spacer to match HeroSection height somewhat or just padding */}
             <View style={{ height: 20 }} />
          </Animated.View>
        )}

        {/* Stats + Social cards */}
        {/* Only show stats overlapping if in globe mode, otherwise normal margin */}
        <View style={[styles.cardsRow, viewMode === 'list' && styles.cardsRowListMode]}>
          <View style={styles.card}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>Travel Score</Text>
            </View>
            <Text style={styles.cardTitle}>Your footprint</Text>
            <Text style={styles.cardMetric}>{countriesCount} countries • {citiesCount} cities</Text>
            <Text style={styles.cardHint}>From your real Supabase profile</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.cardBadge, styles.cardBadgeAccent]}>
              <Text style={[styles.cardBadgeText, styles.cardBadgeAccentText]}>Live</Text>
            </View>
            <Text style={styles.cardTitle}>New this month</Text>
            <Text style={styles.cardMetric}>+{newThisMonth}</Text>
            <Text style={styles.cardHint}>Recent trips & places added</Text>
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent highlights</Text>
            <Pressable 
              onPress={() => { /* Navigate to full list */ }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="View all highlights"
            >
              <Text style={styles.sectionLink}>View all</Text>
            </Pressable>
          </View>
          <View style={styles.highlightsRow}>
            {trips.slice(0, 3).map(trip => (
              <View key={trip.id} style={styles.highlightCard}>
                <Text style={styles.highlightTitle}>{trip.name || trip.city || 'Trip'}</Text>
                <Text style={styles.highlightMeta}>{trip.country || 'Unknown country'}</Text>
                <Text style={styles.highlightHint}>{trip.places?.length || 0} places saved</Text>
              </View>
            ))}
            {trips.length === 0 && (
              <Text style={styles.emptyText}>Add trips to see highlights here.</Text>
            )}
          </View>
        </View>

        {/* Space for future sections */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Country Detail Panel */}
      <CountryDetailPanel
        country={selectedCountry}
        visible={panelVisible}
        onClose={handleClosePanel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  filmGrain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.05,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  iconPressed: {
    opacity: 0.7,
  },
  kicker: {
    fontFamily: 'OutfitMedium',
    fontSize: 13,
    color: theme.colors.text.secondary,
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: 'OutfitSemiBold',
    fontSize: 26,
    color: theme.colors.text.primary,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'RobotoRegular',
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  avatarWrapper: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary.blue,
    borderWidth: 2,
    borderColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 48,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'RobotoRegular',
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: -24,
    zIndex: 10, // Ensure it sits above globe reset button area
  },
  cardsRowListMode: {
    marginTop: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,221,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardBadgeText: {
    fontFamily: 'RobotoMedium',
    fontSize: 12,
    color: theme.colors.primary.blue,
  },
  cardBadgeAccent: {
    backgroundColor: theme.colors.primary.blue,
  },
  cardBadgeAccentText: {
    color: '#fff',
  },
  cardTitle: {
    fontFamily: 'OutfitSemiBold',
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  cardMetric: {
    fontFamily: 'OutfitBold',
    fontSize: 20,
    color: theme.colors.text.primary,
    marginTop: 6,
  },
  cardHint: {
    fontFamily: 'RobotoRegular',
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'OutfitSemiBold',
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  sectionLink: {
    fontFamily: 'RobotoMedium',
    fontSize: 14,
    color: theme.colors.primary.blue,
  },
  highlightsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  highlightTitle: {
    fontFamily: 'OutfitSemiBold',
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  highlightMeta: {
    fontFamily: 'RobotoMedium',
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  highlightHint: {
    fontFamily: 'RobotoRegular',
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  emptyText: {
    fontFamily: 'RobotoRegular',
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  bottomSpacer: {
    height: 60,
  },
  // List View Styles
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  listHeader: {
    fontFamily: 'OutfitSemiBold',
    fontSize: 18,
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  flagPlaceholder: {
    width: 40,
    height: 28,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flagText: {
    fontSize: 10,
    fontFamily: 'RobotoBold',
    color: theme.colors.neutral[600],
  },
  countryName: {
    flex: 1,
    fontFamily: 'RobotoMedium',
    fontSize: 16,
    color: theme.colors.text.primary,
  },
});
