/**
 * PlaceCard Component - GalliGo React Native
 *
 * Card displaying a place with image, category, and details
 */

import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H3, Body, Caption } from '@/components/ui';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

// Category to icon mapping
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: 'restaurant',
  coffee: 'cafe',
  activity: 'bicycle',
  hotel: 'bed',
  sightseeing: 'camera',
  shopping: 'cart',
  nightlife: 'musical-notes',
  bar: 'beer',
};

export interface PlaceCardProps {
  /**
   * Place name
   */
  name: string;

  /**
   * Place category
   */
  category: string;

  /**
   * City name
   */
  city: string;

  /**
   * Country name
   */
  country?: string;

  /**
   * Image URL
   */
  imageUrl?: string;

  /**
   * Number of friend recommendations
   */
  recommendationCount?: number;

  /**
   * Callback when card is pressed
   */
  onPress?: () => void;
}

export function PlaceCard({
  name,
  category,
  city,
  country,
  imageUrl,
  recommendationCount,
  onPress,
}: PlaceCardProps) {
  const iconName = CATEGORY_ICONS[category] || 'location';
  const location = country ? `${city}, ${country}` : city;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Image */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name={iconName} size={32} color={colors.neutral[400]} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name={iconName} size={16} color={colors.primary.blue} />
          <Caption color={colors.neutral[600]} style={styles.category}>
            {category}
          </Caption>
        </View>

        <H3 numberOfLines={2} style={styles.name}>
          {name}
        </H3>

        <Body color={colors.neutral[600]} numberOfLines={1} style={styles.location}>
          {location}
        </Body>

        {recommendationCount && recommendationCount > 0 && (
          <View style={styles.badge}>
            <Ionicons name="people" size={12} color={colors.primary.blue} />
            <Caption color={colors.primary.blue} style={styles.badgeText}>
              {recommendationCount} {recommendationCount === 1 ? 'friend' : 'friends'}
            </Caption>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    overflow: 'hidden',
    marginBottom: spacing[3],
  },
  cardPressed: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.neutral[100],
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[2],
  },
  category: {
    textTransform: 'capitalize',
  },
  name: {
    marginBottom: spacing[1],
  },
  location: {
    marginBottom: spacing[2],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary.blue + '10', // 10% opacity
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
