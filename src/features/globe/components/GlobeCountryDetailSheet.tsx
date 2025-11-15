import React, { useMemo } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import type { CountryGlobeData } from '../types';
import { theme } from '@/theme';

interface GlobeCountryDetailSheetProps {
  country: CountryGlobeData | null;
  visible: boolean;
  onClose: () => void;
}

export function GlobeCountryDetailSheet({ country, visible, onClose }: GlobeCountryDetailSheetProps) {
  const stats = useMemo(() => {
    if (!country) return [];
    return [
      { label: 'Trips', value: country.tripCount },
      { label: 'Places', value: country.placeCount },
      { label: 'Friends', value: country.friendCount },
    ];
  }, [country]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text variant="h4">{country?.name}</Text>
          <Text variant="bodySmall" style={styles.iso}>
            ISO3 · {country?.iso3}
          </Text>
          <View style={styles.statRow}>
            {stats.map(stat => (
              <View key={stat.label} style={styles.statCard}>
                <Text variant="label" style={styles.statLabel}>
                  {stat.label}
                </Text>
                <Text variant="h3">{stat.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            <Button variant="secondary" onPress={onClose}>
              {`View places in ${country?.name ?? ''}`}
            </Button>
            <Button onPress={onClose}>Start a trip here</Button>
          </View>
          <Button variant="ghost" onPress={onClose}>
            Close
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(19, 22, 25, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.primary.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: theme.spacing[8],
    gap: theme.spacing[6],
  },
  iso: {
    color: theme.colors.text.muted,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing[4],
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.primary.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    padding: theme.spacing[4],
  },
  statLabel: {
    color: theme.colors.text.secondary,
  },
  actions: {
    gap: theme.spacing[4],
  },
});
