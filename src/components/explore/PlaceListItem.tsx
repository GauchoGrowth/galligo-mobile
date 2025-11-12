/**
 * PlaceListItem Component - GalliGo React Native
 * Port of web app "row" variant with marker stats
 * Matches NetworkCityPlacesPage structure
 */

import React from 'react';
import { View, Image, Pressable, Text, StyleSheet } from 'react-native';
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
      style={styles.container}
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
    padding: spacing[3],
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing[2],
    ...shadows[1],
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
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[900],
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.neutral[700],
  },
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.white,
    backgroundColor: colors.neutral[100],
  },
  friendCount: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  markerStatsContainer: {
    marginTop: 2,
  },
});
