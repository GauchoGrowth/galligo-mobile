import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { theme } from '@/theme';
import { useTravelLogGlobeData } from '../hooks/useTravelLogGlobeData';
import { GlobeCanvas } from './GlobeCanvas';
import { GlobeCountryDetailSheet } from './GlobeCountryDetailSheet';
import type { CountryGlobeData } from '../types';

interface TravelLogGlobeProps {
  onCountryChange?: (iso2: string | null) => void;
}

export function TravelLogGlobe({ onCountryChange }: TravelLogGlobeProps) {
  const { countriesByIso3, isLoading, error } = useTravelLogGlobeData();
  const [selectedCountry, setSelectedCountry] = useState<CountryGlobeData | null>(null);

  const handleSelection = useCallback(
    (country: CountryGlobeData | null) => {
      setSelectedCountry(country);
      onCountryChange?.(country ? country.iso2.toLowerCase() : null);
    },
    [onCountryChange]
  );

  const legend = useMemo(
    () => [
      { label: 'Home & lived', color: theme.colors.primary.blue },
      { label: 'Visited', color: theme.colors.primary.blueHover },
      { label: 'Wishlist', color: theme.colors.brand.sunset },
      { label: 'Friends only', color: theme.colors.brand.goldenHour },
    ],
    []
  );

  // Always render globe even if loading or error - show empty globe if no data
  // This allows testing the 3D globe even when network requests fail
  const shouldRenderGlobe = !isLoading || error;

  return (
    <>
      <Card style={styles.card}>
        <Text variant="h4" style={styles.title}>
          Your world at a glance
        </Text>
        <View style={styles.globeContainer}>
          {shouldRenderGlobe ? (
            <GlobeCanvas countriesByIso3={countriesByIso3} onCountrySelect={handleSelection} />
          ) : (
            <View style={styles.loadingContainer}>
              <Text variant="bodySmall" style={styles.loadingText}>Loading globe...</Text>
            </View>
          )}
        </View>
        <View style={styles.legendRow}>
          {legend.map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
              <Text variant="bodySmall">{item.label}</Text>
            </View>
          ))}
        </View>
      </Card>
      <GlobeCountryDetailSheet
        country={selectedCountry}
        visible={!!selectedCountry}
        onClose={() => handleSelection(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
    backgroundColor: theme.colors.brand.offWhite,
  },
  title: {
    color: theme.colors.text.primary,
  },
  globeContainer: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text.secondary,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
