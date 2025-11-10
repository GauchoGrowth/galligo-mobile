/**
 * CountryFlags Component
 *
 * Displays horizontal scrollable list of visited country flags
 * Uses flagcdn.com for flag images
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { theme } from '@/theme';

const { colors, spacing } = theme;

interface CountryFlagsProps {
  countryCodes: string[]; // ISO2 country codes (e.g., 'us', 'fr', 'jp')
  selectedCountryCode?: string | null;
  onFlagPress?: (countryCode: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function CountryFlags({
  countryCodes,
  selectedCountryCode,
  onFlagPress,
  size = 'md',
}: CountryFlagsProps) {
  const flagSize = size === 'sm' ? 32 : size === 'md' ? 40 : 48;
  const borderWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4;

  if (countryCodes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {countryCodes.map((countryCode) => {
          const isSelected = selectedCountryCode === countryCode;
          const flagUrl = `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;

          return (
            <Pressable
              key={countryCode}
              onPress={() => onFlagPress?.(countryCode)}
              style={[
                styles.flagContainer,
                { width: flagSize, height: flagSize },
                isSelected && styles.flagContainerSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${countryCode}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Image
                source={{ uri: flagUrl }}
                style={[
                  styles.flag,
                  { width: flagSize - borderWidth * 2, height: flagSize - borderWidth * 2 },
                ]}
                resizeMode="cover"
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[3],
  },
  scrollContent: {
    paddingHorizontal: spacing.pagePaddingMobile,
    gap: spacing[2],
  },
  flagContainer: {
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.neutral[300],
    overflow: 'hidden',
    backgroundColor: colors.primary.white,
  },
  flagContainerSelected: {
    borderColor: colors.primary.blue,
    borderWidth: 4,
  },
  flag: {
    borderRadius: 999,
  },
});
