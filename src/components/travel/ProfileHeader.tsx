/**
 * ProfileHeader Component
 *
 * Displays user profile info between map and tabs
 * Revamped for a modern, clean look
 */

import React from 'react';
import { View, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BodySmall, H2 } from '@/components/ui';
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
        {/* Optional: Online/Status indicator could go here */}
      </View>

      {/* Name and Friends */}
      <View style={styles.infoContainer}>
        <H2 weight="extrabold" style={styles.nameText}>{displayName}</H2>
        <View style={styles.statsRow}>
          <Ionicons name="people-outline" size={14} color={colors.neutral[500]} />
          <BodySmall color={colors.neutral[500]}>{friendCount} friends</BodySmall>
        </View>
      </View>

      {/* Logout/Settings Button */}
      {onLogoutPress && (
        <Pressable
          onPress={onLogoutPress}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={22} color={colors.neutral[700]} />
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
    paddingVertical: spacing[5],
    backgroundColor: 'transparent', // Let background show through
    gap: spacing[4],
  },
  avatarContainer: {
    flexShrink: 0,
    // Avatar Shadow
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    borderWidth: 3,
    borderColor: colors.primary.white,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary.white,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 22, // Slightly larger
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  actionButtonPressed: {
    backgroundColor: colors.neutral[100],
  },
});
