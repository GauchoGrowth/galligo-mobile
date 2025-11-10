/**
 * ProfileHeader Component
 *
 * Displays user profile info between map and tabs
 * Shows avatar, name, and friend count
 */

import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, H2 } from '@/components/ui';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

interface ProfileHeaderProps {
  displayName: string;
  avatarUrl?: string | null;
  friendCount?: number;
  onLogoutPress?: () => void;
}

export function ProfileHeader({
  displayName,
  avatarUrl,
  friendCount = 0,
  onLogoutPress,
}: ProfileHeaderProps) {
  // Get initials for fallback avatar
  const getInitials = (name: string): string => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <H2 weight="semibold" color={colors.primary.white}>
              {getInitials(displayName)}
            </H2>
          </View>
        )}
      </View>

      {/* Name and Friends */}
      <View style={styles.infoContainer}>
        <H2 weight="bold">{displayName}</H2>
        <Body color={colors.neutral[600]}>{friendCount} friends</Body>
      </View>

      {/* Logout/Settings Button */}
      {onLogoutPress && (
        <Pressable
          onPress={onLogoutPress}
          style={styles.logoutButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.neutral[700]} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[4],
    backgroundColor: colors.primary.white,
    gap: spacing[3],
  },
  avatarContainer: {
    flexShrink: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  infoContainer: {
    flex: 1,
  },
  logoutButton: {
    flexShrink: 0,
    padding: spacing[2],
  },
});
