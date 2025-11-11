/**
 * WishlistCard Component
 *
 * Displays a place from the wishlist (marked as "wanttogo")
 * Shows place details, recommenders, and quick actions
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Body, Caption, H3 } from '@/components/ui/Text';
import { theme } from '@/theme';
import type { WishlistPlace } from '@/types/shared';

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

interface WishlistCardProps {
  wishlistPlace: WishlistPlace;
  onPress?: () => void;
  onRemove: () => void;
}

export function WishlistCard({
  wishlistPlace,
  onPress,
  onRemove,
}: WishlistCardProps) {
  const { place, recommenders } = wishlistPlace;

  const iconName = CATEGORY_ICONS[place.category || 'restaurant'] || 'location';
  const location = place.country ? `${place.city}, ${place.country}` : place.city || '';

  // Show up to 3 recommender avatars
  const displayedRecommenders = recommenders.slice(0, 3);
  const remainingCount = Math.max(0, recommenders.length - 3);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {/* Place Info */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
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

          {/* Remove Button */}
          <Pressable
            style={styles.removeButton}
            onPress={(e) => {
              e?.stopPropagation?.();
              onRemove();
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
          </Pressable>
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

        {/* Recommenders */}
        {recommenders.length > 0 && (
          <View style={styles.recommendersContainer}>
            <View style={styles.avatarStack}>
              {displayedRecommenders.map((recommender, index) => (
                <View
                  key={recommender.id}
                  style={[
                    styles.avatarWrapper,
                    { marginLeft: index > 0 ? -spacing[2] : 0, zIndex: displayedRecommenders.length - index },
                  ]}
                >
                  <Avatar
                    src={recommender.avatarUrl}
                    initials={recommender.name.substring(0, 2)}
                    size="sm"
                    style={styles.avatar}
                  />
                </View>
              ))}
            </View>

            <Caption color={colors.neutral[600]} style={styles.recommendersText}>
              Recommended by{' '}
              <Caption weight="semibold" color={colors.neutral[900]}>
                {displayedRecommenders.map(r => r.name.split(' ')[0]).join(', ')}
              </Caption>
              {remainingCount > 0 && (
                <Caption color={colors.neutral[600]}>
                  {' '}+{remainingCount} more
                </Caption>
              )}
            </Caption>
          </View>
        )}

        {/* First recommender's note (if any) */}
        {recommenders[0]?.notes && (
          <View style={styles.noteContainer}>
            <Body color={colors.neutral[700]} numberOfLines={2} style={styles.note}>
              "{recommenders[0].notes}"
            </Body>
            {recommenders.length > 1 && (
              <Caption color={colors.neutral[500]} style={styles.moreNotes}>
                +{recommenders.length - 1} more {recommenders.length === 2 ? 'note' : 'notes'}
              </Caption>
            )}
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
  content: {
    padding: spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  category: {
    textTransform: 'capitalize',
  },
  removeButton: {
    padding: spacing[1],
  },
  placeName: {
    marginBottom: spacing[2],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  location: {
    flex: 1,
  },
  recommendersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: spacing[2],
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: colors.primary.white,
    borderRadius: 16,
  },
  avatar: {
    borderWidth: 0,
  },
  recommendersText: {
    flex: 1,
  },
  noteContainer: {
    marginTop: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.secondary.purple + '08',
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary.purple,
  },
  note: {
    fontStyle: 'italic',
    marginBottom: spacing[1],
  },
  moreNotes: {
    marginTop: spacing[1],
  },
});
