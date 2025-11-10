/**
 * FilterChip Component
 *
 * Dismissible chip showing active filter
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BodySmall } from '@/components/ui';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

interface FilterChipProps {
  label: string;
  onDismiss: () => void;
}

export function FilterChip({ label, onDismiss }: FilterChipProps) {
  return (
    <Pressable
      style={styles.chip}
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel={`Remove ${label} filter`}
    >
      <BodySmall weight="medium" color={colors.primary.blue}>
        {label}
      </BodySmall>
      <Ionicons name="close" size={16} color={colors.primary.blue} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.blue + '20', // 20% opacity
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.pagePaddingMobile,
    marginBottom: spacing[3],
    alignSelf: 'flex-start',
    gap: spacing[1],
  },
  icon: {
    marginLeft: spacing[1],
  },
});
