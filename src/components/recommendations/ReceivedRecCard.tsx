/**
 * ReceivedRecCard Component
 *
 * Displays a recommendation received from a friend
 * Shows sender info, place details, note, and wishlist action
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Body, Caption, H3 } from '@/components/ui/Text';
import { theme } from '@/theme';
import type { ReceivedRecommendation } from '@/types/shared';

const { colors, spacing, borderRadius, shadows } = theme;

// Category to icon mapping
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: 'restaurant',
  coffee: 'cafe',
  activity: 'bicycle',
  hotel: 'bed',
  sightseeing: 'camera',
  shopping: 'cart',
  nightlife: 'musical-notes',
};

interface ReceivedRecCardProps {
  recommendation: ReceivedRecommendation;
  onPress?: () => void;
  onToggleWishlist: () => void;
}

export function ReceivedRecCard({
  recommendation,
  onPress,
  onToggleWishlist,
}: ReceivedRecCardProps) {
  const { place, sender, notes, currentUserMarker } = recommendation;
  const isInWishlist = currentUserMarker === 'wanttogo';

  const iconName = CATEGORY_ICONS[place.category || 'restaurant'] || 'location';
  const location = place.country ? `${place.city}, ${place.country}` : place.city || '';

  // Parse date for "time ago" display
  const createdDate = new Date(recommendation.created_at);
  const now = new Date();
  const hoursDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
  const daysDiff = Math.floor(hoursDiff / 24);

  let timeAgo = '';
  if (hoursDiff < 1) {
    timeAgo = 'Just now';
  } else if (hoursDiff < 24) {
    timeAgo = `${hoursDiff}h ago`;
  } else if (daysDiff === 1) {
    timeAgo = 'Yesterday';
  } else if (daysDiff < 7) {
    timeAgo = `${daysDiff}d ago`;
  } else {
    timeAgo = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {/* Sender Header */}
      <View style={styles.header}>
        <Avatar
          src={sender.avatarUrl}
          initials={sender.name.substring(0, 2)}
          size="sm"
        />
        <View style={styles.senderInfo}>
          <Body weight="semibold">{sender.name}</Body>
          <Caption color={colors.neutral[600]}>{timeAgo}</Caption>
        </View>

        {/* Wishlist Toggle */}
        <Pressable
          style={styles.wishlistButton}
          onPress={(e) => {
            e?.stopPropagation?.();
            onToggleWishlist();
          }}
          hitSlop={8}
        >
          <Ionicons
            name={isInWishlist ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isInWishlist ? colors.secondary.purple : colors.neutral[600]}
          />
        </Pressable>
      </View>

      {/* Place Info */}
      <View style={styles.placeContent}>
        <View style={styles.placeHeader}>
          <Ionicons
            name={iconName}
            size={16}
            color={colors.primary.blue}
          />
          {place.category && (
            <Caption color={colors.neutral[600]} style={styles.category}>
              {place.category}
            </Caption>
          )}
        </View>

        <H3 numberOfLines={2} style={styles.placeName}>
          {place.display_name || place.name}
        </H3>

        {location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.neutral[500]} />
            <Caption color={colors.neutral[600]} numberOfLines={1} style={styles.location}>
              {location}
            </Caption>
          </View>
        )}

        {/* Sender's Note */}
        {notes && (
          <View style={styles.noteContainer}>
            <Body color={colors.neutral[700]} numberOfLines={3} style={styles.note}>
              "{notes}"
            </Body>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  senderInfo: {
    flex: 1,
    marginLeft: spacing[2],
  },
  wishlistButton: {
    padding: spacing[1],
  },
  placeContent: {
    padding: spacing[4],
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[2],
  },
  category: {
    textTransform: 'capitalize',
  },
  placeName: {
    marginBottom: spacing[2],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[2],
  },
  location: {
    flex: 1,
  },
  noteContainer: {
    marginTop: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.blue,
  },
  note: {
    fontStyle: 'italic',
  },
});
