/**
 * PlaceListItem Component - GalliGo React Native
 * Port of web app "row" variant with marker stats
 * Matches NetworkCityPlacesPage structure
 * Modernized with softer corners and cleaner shadows
 */

import React from 'react';
import { View, Image, Pressable, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MarkerStats, type MarkerStatsType } from '@/components/markers';
import { theme } from '@/theme';

const { colors, spacing, borderRadius, shadows } = theme;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Category emoji mapping (matches web app)
const CATEGORY_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  coffee: '☕',
  bar: '🍺',
  cafe: '☕',
  activity: '🎯',
  hotel: '🏨',
  sightseeing: '🏛️',
  shopping: '🛍️',
  nightlife: '🎉',
};

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    restaurant: 'Restaurant',
    coffee: 'Coffee',
    bar: 'Bar',
    cafe: 'Cafe',
    activity: 'Activity',
    hotel: 'Hotel',
    sightseeing: 'Sightseeing',
    shopping: 'Shopping',
    nightlife: 'Nightlife',
  };
  return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

export interface PlaceListItemProps {
  placeName: string;
  category: string;
  friends: Array<{
    userId: string;
    name: string;
    avatarUrl: string;
  }>;
  markerStats?: MarkerStatsType;
  onPress: () => void;
  index?: number;
}

export function PlaceListItem({
  placeName,
  category,
  friends,
  markerStats,
  onPress,
  index = 0,
}: PlaceListItemProps) {
  const categoryEmoji = CATEGORY_EMOJI[category] || '📍';
  const categoryLabel = getCategoryLabel(category);

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 40).springify()}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      accessible={true}
      accessibilityLabel={`${placeName}, ${categoryLabel}. ${friends.length} ${friends.length === 1 ? 'friend' : 'friends'}`}
      accessibilityRole="button"
    >
      {/* Content */}
      <View style={styles.content}>
        {/* Place Name + Category Badge */}
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.placeName}>
            {placeName}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
          </View>
        </View>

        {/* Friend Avatars + Count */}
        {friends.length > 0 && (
          <View style={styles.friendsRow}>
            <View style={styles.avatarsContainer}>
              {friends.slice(0, 3).map((friend, idx) => (
                <Image
                  key={friend.userId}
                  source={{ uri: friend.avatarUrl }}
                  style={[
                    styles.friendAvatar,
                    idx > 0 && { marginLeft: -8 },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.friendCount}>
              {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </Text>
          </View>
        )}

        {/* Marker Stats */}
        {markerStats && (
          <View style={styles.markerStatsContainer}>
            <MarkerStats stats={markerStats} compact />
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing[4], // Increased padding
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.xl, // Softer corners
    marginBottom: spacing[3],
    // Clean shadow instead of border
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  content: {
    flex: 1,
    gap: spacing[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  placeName: {
    fontSize: 16, // Slightly larger
    fontWeight: '700',
    color: colors.neutral[900],
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md, // Softer badge
    // No border for badge
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: 2,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.primary.white,
    backgroundColor: colors.neutral[100],
  },
  friendCount: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  markerStatsContainer: {
    marginTop: spacing[2],
  },
});
