import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { theme } from '@/theme';
import { useTravelLogGlobeData } from '../hooks/useTravelLogGlobeData';
import { GlobeCanvas } from './GlobeCanvas';
import { GlobeCountryDetailSheet } from './GlobeCountryDetailSheet';
import type { CountryGlobeData } from '../types';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface TravelLogGlobeProps {
  onCountryChange?: (iso2: string | null) => void;
}

export function TravelLogGlobe({ onCountryChange }: TravelLogGlobeProps) {
  const { countriesByIso3, isLoading, error } = useTravelLogGlobeData();
  const [selectedCountry, setSelectedCountry] = useState<CountryGlobeData | null>(null);

  const hasError = !!error;
  const isReady = !isLoading && !hasError;

  console.log('[TravelLogGlobe] render', {
    isLoading,
    hasError,
    countriesCount: Object.keys(countriesByIso3).length,
  });

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

  let globeContent: React.ReactNode;

  if (isLoading) {
    globeContent = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.blue} />
        <Text variant="bodySm" style={styles.stateMessage}>
          Loading globe...
        </Text>
      </View>
    );
  } else if (hasError) {
    globeContent = (
      <View style={styles.errorContainer}>
        <Text variant="bodyMd" style={styles.errorTitle}>
          Failed to load travel data.
        </Text>
        <Text variant="bodySm" style={styles.errorSubtitle}>
          Please check your connection and try again.
        </Text>
      </View>
    );
  } else {
    globeContent = (
      <ErrorBoundary
        fallback={
          <View style={styles.errorContainer}>
            <Text variant="bodyMd" style={styles.errorTitle}>
              Globe failed to load.
            </Text>
          </View>
        }
      >
        <GlobeCanvas countriesByIso3={countriesByIso3} onCountrySelect={handleSelection} />
      </ErrorBoundary>
    );
  }

  return (
    <>
      <Card style={styles.card}>
        <Text variant="h4" style={styles.title}>
          Your world at a glance
        </Text>
        <View style={styles.globeContainer}>
          {globeContent}
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
        visible={isReady && !!selectedCountry}
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
    padding: theme.spacing[6],
  },
  stateMessage: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[3],
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[6],
    gap: theme.spacing[2],
  },
  errorTitle: {
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
