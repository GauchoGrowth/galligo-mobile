/**
 * EmptyRecState Component
 *
 * Empty state component for different recommendation tabs
 * Provides context-specific messaging and actions
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, Caption, H2 } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';

const { colors, spacing } = theme;

type EmptyStateType = 'requests' | 'received' | 'sent' | 'wishlist';

interface EmptyRecStateProps {
  type: EmptyStateType;
  onAction?: () => void;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
}> = {
  requests: {
    icon: 'chatbubbles-outline',
    title: 'No Active Requests',
    description: 'When your friends ask for recommendations, they\'ll appear here. You can also create your own requests!',
    actionLabel: 'Create Request',
  },
  received: {
    icon: 'gift-outline',
    title: 'No Recommendations Yet',
    description: 'Recommendations from friends will appear here. Start sending recommendations to get the conversation going!',
  },
  sent: {
    icon: 'paper-plane-outline',
    title: 'No Recommendations Sent',
    description: 'Share your favorite places with friends! Recommendations you send will appear here.',
    actionLabel: 'Send First Rec',
  },
  wishlist: {
    icon: 'bookmark-outline',
    title: 'No Saved Places',
    description: 'Save recommendations to your wishlist to keep track of places you want to visit.',
  },
};

export function EmptyRecState({ type, onAction }: EmptyRecStateProps) {
  const config = EMPTY_STATE_CONFIG[type];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={config.icon}
          size={48}
          color={colors.neutral[400]}
        />
      </View>

      <H2 style={styles.title}>{config.title}</H2>

      <Body
        color={colors.neutral[600]}
        style={styles.description}
      >
        {config.description}
      </Body>

      {config.actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onPress={onAction}
        >
          {config.actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[6],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 22,
  },
});
