/**
 * SentRecCard Component
 *
 * Displays a recommendation you've sent to a friend
 * Shows recipient info, place details, note, and engagement status
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Body, Caption, H3 } from '@/components/ui/Text';
import { theme } from '@/theme';
import type { SentRecommendation } from '@/types/shared';

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

interface SentRecCardProps {
  recommendation: SentRecommendation;
  onPress?: () => void;
}

export function SentRecCard({ recommendation, onPress }: SentRecCardProps) {
  const { place, recipient, notes, recipientMarker } = recommendation;

  const iconName = CATEGORY_ICONS[place.category || 'restaurant'] || 'location';
  const location = place.country ? `${place.city}, ${place.country}` : place.city || '';

  // Check engagement
  const hasSaved = recipientMarker === 'wanttogo';
  const hasLoved = recipientMarker === 'loved';
  const hasLiked = recipientMarker === 'liked';
  const hasBeenThere = recipientMarker === 'hasbeen';

  const hasEngaged = hasSaved || hasLoved || hasLiked || hasBeenThere;

  // Parse date for "time ago" display
  const createdDate = new Date(recommendation.created_at);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  let timeAgo = '';
  if (daysDiff === 0) {
    timeAgo = 'Today';
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
      {/* Recipient Header */}
      <View style={styles.header}>
        <Caption color={colors.neutral[600]}>To:</Caption>
        <Avatar
          src={recipient.avatarUrl}
          initials={recipient.name.substring(0, 2)}
          size="sm"
          style={styles.avatar}
        />
        <View style={styles.recipientInfo}>
          <Body weight="semibold">{recipient.name}</Body>
          <Caption color={colors.neutral[600]}>{timeAgo}</Caption>
        </View>

        {/* Engagement Badge */}
        {hasEngaged && (
          <View style={[
            styles.engagementBadge,
            hasSaved && styles.savedBadge,
            hasLoved && styles.lovedBadge,
            hasLiked && styles.likedBadge,
          ]}>
            {hasSaved && <Ionicons name="bookmark" size={14} color={colors.accent.purple} />}
            {hasLoved && <Ionicons name="heart" size={14} color={colors.success[500]} />}
            {hasLiked && <Ionicons name="checkmark" size={14} color={colors.primary.blue} />}
            {hasBeenThere && <Ionicons name="location" size={14} color={colors.neutral[600]} />}
          </View>
        )}
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

        {/* Your Note */}
        {notes && (
          <View style={styles.noteContainer}>
            <Caption color={colors.neutral[600]} style={styles.noteLabel}>
              Your note:
            </Caption>
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
    backgroundColor: colors.neutral.white,
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
    gap: spacing[2],
  },
  avatar: {
    marginLeft: spacing[1],
  },
  recipientInfo: {
    flex: 1,
  },
  engagementBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  savedBadge: {
    backgroundColor: colors.accent.purple + '15',
  },
  lovedBadge: {
    backgroundColor: colors.success[50],
  },
  likedBadge: {
    backgroundColor: colors.primary.blue + '15',
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
  },
  noteLabel: {
    marginBottom: spacing[1],
  },
  note: {
    fontStyle: 'italic',
  },
});
