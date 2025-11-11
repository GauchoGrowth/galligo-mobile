/**
 * CountryHero Component
 *
 * Full-width hero section with:
 * - Background image from Unsplash (using lib/unsplash.ts)
 * - Gradient overlay (dark gradient from bottom)
 * - Country flag + name + stats overlay
 * - Parallax scroll effect (background moves at 0.5x speed)
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  SharedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { H1, BodySmall } from '@/components/ui';
import { theme } from '@/theme';
import { LAYOUT, OPACITY } from '@/lib/animations/constants';
import { getCountryImageUrl } from '@/lib/unsplash';

const { colors, spacing } = theme;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CountryHeroProps {
  /**
   * Country name (e.g., "Argentina")
   */
  countryName: string;

  /**
   * Country code (e.g., "ar")
   */
  countryCode: string;

  /**
   * Number of cities in this country
   */
  citiesCount: number;

  /**
   * Number of places in this country
   */
  placesCount: number;

  /**
   * Number of homes in this country
   */
  homesCount?: number;

  /**
   * Number of trips in this country
   */
  tripsCount?: number;

  /**
   * Array of home city names
   */
  homeCities?: string[];

  /**
   * Array of trip city names (or trip names)
   */
  tripCities?: string[];

  /**
   * Callback when home stat is tapped
   */
  onHomeTap?: () => void;

  /**
   * Callback when trip stat is tapped
   */
  onTripTap?: () => void;

  /**
   * Scroll Y position (for parallax effect)
   */
  scrollY: SharedValue<number>;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

export function CountryHero({
  countryName,
  countryCode,
  citiesCount,
  placesCount,
  homesCount = 0,
  tripsCount = 0,
  homeCities = [],
  tripCities = [],
  onHomeTap,
  onTripTap,
  scrollY,
}: CountryHeroProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch country background image
  useEffect(() => {
    async function loadImage() {
      try {
        const url = await getCountryImageUrl(countryName);
        setImageUrl(url);
      } catch (error) {
        console.error('[CountryHero] Failed to load image:', error);
        // Fallback to a placeholder or solid color
      }
    }

    loadImage();
  }, [countryName]);

  // Parallax animation for background image
  const parallaxStyle = useAnimatedStyle(() => {
    if (!scrollY) {
      return {};
    }

    // Move background at 50% scroll speed (parallax effect)
    const translateY = interpolate(
      scrollY.value,
      [0, LAYOUT.PARALLAX_SCROLL_RANGE],
      [0, LAYOUT.PARALLAX_SCROLL_RANGE * LAYOUT.PARALLAX_FACTOR],
      Extrapolate.CLAMP
    );

    // Subtle zoom effect (Ken Burns)
    const scale = interpolate(
      scrollY.value,
      [0, LAYOUT.PARALLAX_SCROLL_RANGE],
      [1, 1.2],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  }, [scrollY]);

  // Flag URL
  const flagUrl = `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`;

  return (
    <View style={styles.container}>
      {/* Background Image with Parallax */}
      {imageUrl && (
        <AnimatedImage
          source={{ uri: imageUrl }}
          style={[styles.backgroundImage, parallaxStyle]}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
        />
      )}

      {/* Fallback if no image */}
      {!imageUrl && <View style={styles.fallbackBackground} />}

      {/* Dark Gradient Overlay */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0)',
          'rgba(0, 0, 0, 0.3)',
          'rgba(0, 0, 0, 0.7)',
          'rgba(0, 0, 0, 0.9)',
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradient}
      />

      {/* Content Overlay */}
      <View style={styles.content}>
        {/* Country Flag */}
        <Image source={{ uri: flagUrl }} style={styles.flag} resizeMode="cover" />

        {/* Country Name */}
        <H1 weight="bold" color={colors.primary.white} style={styles.countryName}>
          {countryName}
        </H1>

        {/* Stats */}
        <BodySmall color={colors.neutral[200]} style={styles.stats}>
          {citiesCount} {citiesCount === 1 ? 'city' : 'cities'} • {placesCount}{' '}
          {placesCount === 1 ? 'place' : 'places'}
        </BodySmall>

        {/* Home/Trip Stats - Interactive */}
        {(homesCount > 0 || tripsCount > 0) && (
          <View style={styles.extraStats}>
            {homesCount > 0 && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onHomeTap?.();
                }}
                style={({ pressed }) => [
                  styles.statPill,
                  pressed && styles.statPillPressed,
                ]}
              >
                <BodySmall color={colors.primary.white} weight="medium">
                  🏠 {homesCount} {homesCount === 1 ? 'Home' : 'Homes'}
                  {homeCities.length > 0 && `: ${homeCities.join(', ')}`}
                </BodySmall>
              </Pressable>
            )}

            {tripsCount > 0 && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onTripTap?.();
                }}
                style={({ pressed }) => [
                  styles.statPill,
                  pressed && styles.statPillPressed,
                ]}
              >
                <BodySmall color={colors.primary.white} weight="medium">
                  🧳 {tripsCount} {tripsCount === 1 ? 'Trip' : 'Trips'}
                </BodySmall>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: LAYOUT.HERO_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: -50, // Extra height for parallax overflow
    left: 0,
    width: SCREEN_WIDTH,
    height: LAYOUT.HERO_HEIGHT + 100, // Extra height for parallax
  },
  fallbackBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: LAYOUT.HERO_HEIGHT,
    backgroundColor: colors.primary.blue,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: LAYOUT.HERO_HEIGHT * 0.7, // Cover bottom 70%
  },
  content: {
    position: 'absolute',
    bottom: spacing[6],
    left: spacing.pagePaddingMobile,
    right: spacing.pagePaddingMobile,
    alignItems: 'flex-start',
  },
  flag: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.primary.white,
    marginBottom: spacing[3],
  },
  countryName: {
    marginBottom: spacing[1],
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  stats: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  extraStats: {
    marginTop: spacing[2],
    flexDirection: 'row',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  statPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statPillPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 0.95 }],
  },
});
