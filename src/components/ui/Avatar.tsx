/**
 * Avatar Component - GalliGo React Native
 *
 * Displays user profile images with fallback to initials
 */

import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Caption } from './Text';
import { theme } from '@/theme';

const { colors, spacing } = theme;

export interface AvatarProps {
  /**
   * Image URL for the avatar
   */
  src?: string | null;

  /**
   * Fallback initials (e.g., "JD" for John Doe)
   */
  initials?: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Additional styles
   */
  style?: ViewStyle;
}

const SIZES = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const FONT_SIZES = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
};

export function Avatar({ src, initials, size = 'md', style }: AvatarProps) {
  const avatarSize = SIZES[size];
  const fontSize = FONT_SIZES[size];

  // Extract initials from src if not provided (e.g., from name)
  const displayInitials = initials?.substring(0, 2).toUpperCase() || '?';

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
        style,
      ]}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <Caption
            style={{ fontSize, fontWeight: '600' }}
            color={colors.primary.white}
          >
            {displayInitials}
          </Caption>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
  },
  image: {
    backgroundColor: colors.neutral[200],
  },
  fallback: {
    backgroundColor: colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
