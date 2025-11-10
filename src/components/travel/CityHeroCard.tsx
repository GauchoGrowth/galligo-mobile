/**
 * CityHeroCard Component
 *
 * City card with hero image matching web app design
 * Shows city image, name, country, and place count
 */

import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H2, Body } from '@/components/ui';
import { CityImage } from './CityImage';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

interface CityHeroCardProps {
  city: string;
  country: string;
  countryCode: string;
  placeCount: number;
  onPress?: () => void;
}

export function CityHeroCard({ city, country, countryCode, placeCount, onPress }: CityHeroCardProps) {
  const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`View ${city}, ${country}`}
    >
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <CityImage city={city} country={country} borderRadiusSize="xl" />

        {/* Overlay Content */}
        <View style={styles.overlay}>
          {/* City Name and Flag */}
          <View style={styles.cityHeader}>
            <Image source={{ uri: flagUrl }} style={styles.flag} resizeMode="cover" />
            <H2 weight="bold" color={colors.primary.white}>
              {city}
            </H2>
          </View>

          {/* Country Name */}
          <Body color={colors.primary.white}>{country}</Body>
        </View>
      </View>

      {/* Place Count */}
      <View style={styles.footer}>
        <Ionicons name="location" size={16} color={colors.primary.blue} />
        <Body color={colors.neutral[700]}>
          {placeCount} {placeCount === 1 ? 'place' : 'places'}
        </Body>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: spacing[3],
  },
  cardPressed: {
    opacity: 0.8,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[4],
    // Semi-transparent background (no gradients in React Native without libraries)
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  flag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
});
