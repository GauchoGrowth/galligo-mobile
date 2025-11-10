/**
 * CityImage Component
 *
 * Loads city hero image from Unsplash with loading and error states
 * Uses expo-image for optimized caching and performance
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { resolveCityImage } from '@/utils/cityImageCache';
import { DEFAULT_CITY_PLACEHOLDER } from '@/utils/unsplashImageUtils';
import { theme } from '@/theme';

const { colors, borderRadius } = theme;

interface CityImageProps {
  city: string;
  country: string;
  style?: any;
  borderRadiusSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function CityImage({ city, country, style, borderRadiusSize = 'lg' }: CityImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const url = await resolveCityImage(city, country);

        if (isMounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`[CityImage] Error loading image for ${city}:`, error);

        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          setImageUrl(DEFAULT_CITY_PLACEHOLDER);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [city, country]);

  // Get border radius value
  const getBorderRadius = () => {
    switch (borderRadiusSize) {
      case 'sm':
        return borderRadius.sm;
      case 'md':
        return borderRadius.md;
      case 'lg':
        return borderRadius.lg;
      case 'xl':
        return borderRadius.xl;
      case '2xl':
        return borderRadius['2xl'];
      default:
        return borderRadius.lg;
    }
  };

  const radius = getBorderRadius();

  return (
    <View style={[styles.container, style, { borderRadius: radius }]}>
      {/* Loading Skeleton */}
      {isLoading && (
        <View style={[styles.skeleton, { borderRadius: radius }]}>
          <ActivityIndicator size="small" color={colors.primary.blue} />
        </View>
      )}

      {/* Image */}
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { borderRadius: radius }]}
          contentFit="cover"
          transition={300}
          placeholder={DEFAULT_CITY_PLACEHOLDER}
          placeholderContentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
