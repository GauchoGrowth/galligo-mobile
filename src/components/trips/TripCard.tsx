/**
 * TripCard Component - GalliGo React Native
 *
 * Card displaying a trip with image, dates, and collaborators
 */

import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { Trip } from '@/types/shared';
import { H2, Body, Caption } from '@/components/ui';
import { getCountryCode } from '@/utils/countryUtils';
import { resolveCityImage } from '@/utils/cityImageCache';
import { DEFAULT_CITY_PLACEHOLDER } from '@/utils/unsplashImageUtils';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

export interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  // Image loading states
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Convert dates to Date objects if needed
  const startDate = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
  const endDate = trip.endDate instanceof Date ? trip.endDate : new Date(trip.endDate);

  // Calculate days away
  const daysAway = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isPast = daysAway < 0;

  // Format date range
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Get country code for circular flag
  const countryCode = getCountryCode(trip.country).toLowerCase();
  const flagUrl = `https://flagcdn.com/w40/${countryCode}.png`;

  // Load city image from Unsplash using existing utility
  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setImageLoading(true);

        // Use existing heroImage or fetch from Unsplash
        let url: string;
        if (trip.heroImage && trip.heroImage.trim()) {
          url = trip.heroImage;
        } else if (trip.imageUrl && trip.imageUrl.trim()) {
          url = trip.imageUrl;
        } else {
          // Fetch from Unsplash using existing utility
          url = await resolveCityImage(trip.city, trip.country);
        }

        if (isMounted) {
          setImageUrl(url);
          setImageLoading(false);
          console.log('[TripCard] Image loaded:', trip.name);
        }
      } catch (error) {
        console.error('[TripCard] Error loading image:', trip.name, error);

        if (isMounted) {
          setImageUrl(DEFAULT_CITY_PLACEHOLDER);
          setImageLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [trip.city, trip.country, trip.heroImage, trip.imageUrl, trip.name]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {/* Loading Spinner */}
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.blue} />
          </View>
        )}

        {/* Background Image with expo-image */}
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            placeholder={DEFAULT_CITY_PLACEHOLDER}
            placeholderContentFit="cover"
            cachePolicy="memory-disk"
          />
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        />

        {/* Days Away Badge (only for upcoming trips) */}
        {!isPast && daysAway > 0 && (
          <View style={styles.badge}>
            <Caption style={styles.badgeText}>
              {daysAway === 1 ? 'Tomorrow' : `${daysAway} days away`}
            </Caption>
          </View>
        )}

        {/* Content Overlay */}
        <View style={styles.content}>
          <H2 style={styles.title} numberOfLines={2}>
            {trip.name}
          </H2>

          {/* Location with Circular Flag (matching CityCard) */}
          <View style={styles.locationRow}>
            <Image
              source={{ uri: flagUrl }}
              style={styles.flag}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <Body style={styles.location} numberOfLines={1}>
              {trip.city}, {trip.country}
            </Body>
          </View>

          {/* Date Range */}
          <Body style={styles.dateRange}>{dateRange}</Body>

          {/* Collaborators */}
          {trip.collaborators && trip.collaborators.length > 0 && (
            <View style={styles.collaborators}>
              {trip.collaborators.slice(0, 5).map((collab, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.avatar,
                    { marginLeft: idx > 0 ? -8 : 0, zIndex: 5 - idx },
                  ]}
                >
                  <Text style={styles.avatarText}>{collab.initials}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: colors.neutral[900],
  },
  cardPressed: {
    opacity: 0.9,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    position: 'absolute',
    borderRadius: borderRadius.xl,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[900],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 4,
    zIndex: 3,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  location: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    flex: 1,
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
    backgroundColor: colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
