/**
 * TripCard Component - GalliGo React Native
 *
 * Card displaying a trip with image, dates, and collaborators
 */

import React from 'react';
import { View, Image, Pressable, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Trip } from '@/types/shared';
import { H2, Body, Caption } from '@/components/ui';
import { getCountryCode } from '@/utils/countryUtils';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

export interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  // Convert dates to Date objects if needed
  const startDate = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
  const endDate = trip.endDate instanceof Date ? trip.endDate : new Date(trip.endDate);

  // Calculate days away
  const daysAway = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isPast = daysAway < 0;

  // Format date range
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Get country flag
  const countryCode = getCountryCode(trip.country);
  const flagUrl = `https://flagcdn.com/w80/${countryCode}.png`;

  // Fallback image
  const imageUrl = trip.heroImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.image}
        imageStyle={styles.imageStyle}
      >
        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        {/* Days away badge (only for upcoming trips) */}
        {!isPast && daysAway > 0 && (
          <View style={styles.badge}>
            <Caption style={styles.badgeText}>
              {daysAway === 1 ? 'Tomorrow' : `${daysAway} days away`}
            </Caption>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <H2 style={styles.title} numberOfLines={2}>
            {trip.name}
          </H2>

          {/* Location */}
          <View style={styles.locationRow}>
            <Image
              source={{ uri: flagUrl }}
              style={styles.flag}
              resizeMode="cover"
            />
            <Body style={styles.location} numberOfLines={1}>
              {trip.city}, {trip.country}
            </Body>
          </View>

          {/* Date range */}
          <Body style={styles.dateRange}>{dateRange}</Body>

          {/* Collaborators */}
          {trip.collaborators && trip.collaborators.length > 0 && (
            <View style={styles.collaborators}>
              {trip.collaborators.slice(0, 5).map((collab, idx) => (
                <Image
                  key={idx}
                  source={{ uri: collab.avatarUrl }}
                  style={[
                    styles.avatar,
                    { marginLeft: idx > 0 ? -8 : 0, zIndex: 5 - idx },
                  ]}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 256,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  cardPressed: {
    opacity: 0.9,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  imageStyle: {
    borderRadius: borderRadius.xl,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[5],
    zIndex: 10,
  },
  title: {
    color: colors.primary.white,
    marginBottom: spacing[1],
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  flag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  location: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  dateRange: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: spacing[3],
  },
  collaborators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
});
