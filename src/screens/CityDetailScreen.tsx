/**
 * City Detail Screen - GalliGo React Native
 *
 * Shows all places in a specific city with filtering
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FullPageSpinner, EmptyState, H1, Body } from '@/components/ui';
import { CityImage } from '@/components/travel/CityImage';
import { PlaceListItem } from '@/components/explore/PlaceListItem';
import { usePlaces, useFriendsNetwork } from '@/lib/api-hooks';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing, borderRadius, shadows } = theme;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = NativeStackScreenProps<RootStackParamList, 'CityDetail'>;

// Category groups matching web app
const CATEGORY_GROUPS = [
  { id: 'all', label: 'All', icon: 'grid-outline' as const },
  { id: 'food_drink', label: 'Food & Drink', icon: 'restaurant-outline' as const, includes: ['restaurant', 'coffee', 'bar', 'cafe'] },
  { id: 'culture', label: 'Culture', icon: 'library-outline' as const, includes: ['sightseeing', 'museum', 'art'] },
  { id: 'nature', label: 'Nature', icon: 'leaf-outline' as const, includes: ['park', 'beach', 'hiking'] },
  { id: 'activity', label: 'Activity', icon: 'bicycle-outline' as const, includes: ['activity', 'sports'] },
];

const getCategoryGroup = (category: string): string => {
  for (const group of CATEGORY_GROUPS) {
    if (group.id === 'all') continue;
    if (group.includes && group.includes.includes(category)) {
      return group.id;
    }
  }
  return category; // fallback to individual category
};

export function CityDetailScreen({ route, navigation }: Props) {
  const { cityName } = route.params;
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch friends network to get real avatar URLs
  const { data: networkData } = useFriendsNetwork();

  // Fetch all places and filter by city
  const { data: allPlaces = [], isLoading } = usePlaces();

  // Filter places for this city
  const cityPlaces = useMemo(() => {
    return allPlaces.filter((place) => place.city === cityName);
  }, [allPlaces, cityName]);

  // Get city data from friends network
  const cityNetworkData = useMemo(() => {
    if (!networkData) return null;
    return networkData.cities.find((c) => c.city === cityName);
  }, [networkData, cityName]);

  // Consolidate places by ID (group friends who recommended same place)
  const consolidatedPlaces = useMemo(() => {
    const placesMap = new Map<string, {
      id: string;
      name: string;
      category: string;
      friends: Array<{
        userId: string;
        name: string;
        avatarUrl: string;
      }>;
      markerStats: {
        loved: number;
        liked: number;
        hasbeen: number;
        wanttogo: number;
      };
    }>();

    // Use real friends data from network if available
    const realFriends = cityNetworkData?.friends || [];

    cityPlaces.forEach((place) => {
      const existing = placesMap.get(place.id);

      // Try to find real friend data
      const realFriend = realFriends.find(() => true); // Get first friend for now
      const friend = {
        userId: realFriend?.userId || `user-${Math.random()}`,
        name: realFriend?.name || 'Demo User',
        avatarUrl: realFriend?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/png?seed=${place.name}`,
      };

      if (existing) {
        if (!existing.friends.some(f => f.userId === friend.userId)) {
          existing.friends.push(friend);
        }
        // Aggregate marker stats
        existing.markerStats.hasbeen += 1;
      } else {
        placesMap.set(place.id, {
          id: place.id,
          name: place.name,
          category: place.category,
          friends: [friend],
          markerStats: {
            loved: 1,
            liked: 0,
            hasbeen: 0,
            wanttogo: 0,
          },
        });
      }
    });

    return Array.from(placesMap.values());
  }, [cityPlaces, cityNetworkData]);

  // Get available category groups from data
  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    consolidatedPlaces.forEach(place => {
      const group = getCategoryGroup(place.category);
      groups.add(group);
    });

    // Return only groups that have data, in defined order
    return CATEGORY_GROUPS.filter(g =>
      g.id === 'all' || groups.has(g.id) || consolidatedPlaces.some(p =>
        g.includes && g.includes.includes(p.category)
      )
    );
  }, [consolidatedPlaces]);

  // Filter by category group
  const filteredPlaces = useMemo(() => {
    if (selectedCategory === 'all') return consolidatedPlaces;

    const group = CATEGORY_GROUPS.find(g => g.id === selectedCategory);
    if (group?.includes) {
      return consolidatedPlaces.filter((place) => group.includes!.includes(place.category));
    }

    // Fallback to individual category
    return consolidatedPlaces.filter((place) => place.category === selectedCategory);
  }, [consolidatedPlaces, selectedCategory]);

  // Get city info (country from first place)
  const cityCountry = cityPlaces[0]?.country || '';

  if (isLoading) {
    return <FullPageSpinner label="Loading places..." />;
  }

  return (
    <View style={styles.container}>
      {/* Hero Section with City Photo */}
      <View style={styles.heroSection}>
        <CityImage
          city={cityName}
          country={cityCountry}
          style={styles.cityHero}
          borderRadiusSize="sm"
        />

        {/* Gradient Overlay for Text */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'transparent', 'rgba(0, 0, 0, 0.75)']}
          locations={[0, 0.4, 1]}
          style={styles.heroOverlay}
        >
          {/* Back Button with Safe Area */}
          <View style={{ paddingTop: insets.top + spacing[2] }}>
            <Pressable
              accessible={true}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary.white} />
            </Pressable>
          </View>

          {/* City Info at Bottom */}
          <View style={styles.heroInfo}>
            <H1 style={styles.cityName}>{cityName}</H1>
            {cityCountry && (
              <Body style={styles.cityCountry}>{cityCountry}</Body>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Category Filters with Animations */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
        style={styles.categories}
      >
        {availableGroups.map((group, index) => {
          const isSelected = selectedCategory === group.id;
          return (
            <AnimatedPressable
              key={group.id}
              entering={FadeIn.delay(index * 50)}
              accessible={true}
              accessibilityLabel={`Filter by ${group.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(group.id);
              }}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
            >
              <Ionicons
                name={group.icon}
                size={12}
                color={isSelected ? colors.primary.blue : colors.neutral[600]}
              />
              <Body
                style={
                  isSelected
                    ? [styles.categoryLabel, styles.categoryLabelActive]
                    : styles.categoryLabel
                }
              >
                {group.label}
              </Body>
            </AnimatedPressable>
          );
        })}
      </ScrollView>

      {/* Compact Places List */}
      {filteredPlaces.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="location-outline"
            title={selectedCategory === 'all' ? 'No places yet' : 'No matches'}
            description={
              selectedCategory === 'all'
                ? 'Be the first to share a discovery in this city!'
                : `No ${selectedCategory === 'restaurant' ? 'restaurants' : selectedCategory + ' spots'} found.`
            }
          />
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          renderItem={({ item, index }) => (
            <PlaceListItem
              placeName={item.name}
              category={item.category}
              friends={item.friends}
              markerStats={item.markerStats}
              onPress={() => {
                navigation.navigate('PlaceDetail', { placeId: item.id });
              }}
              index={index}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
  heroSection: {
    height: 280,
    position: 'relative',
  },
  cityHero: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral[200],
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.pagePaddingMobile,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    gap: spacing[1],
  },
  cityName: {
    color: colors.primary.white,
    fontSize: 36,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  cityCountry: {
    color: colors.primary.white,
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  categories: {
    backgroundColor: colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    flexGrow: 0,
    flexShrink: 0,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 28,
    backgroundColor: colors.neutral[100],
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  categoryChipActive: {
    backgroundColor: colors.primary.blue + '15',
    borderColor: colors.primary.blue,
    borderWidth: 1.5,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[600],
    lineHeight: 16,
  },
  categoryLabelActive: {
    color: colors.primary.blue,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  listContent: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingTop: spacing[2],
    paddingBottom: spacing[6],
  },
});
