/**
 * CityCard Component - GalliGo React Native
 *
 * Displays a city with friends and their places
 */

import React from 'react';
import { View, Pressable, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { H3, Body, Caption } from '@/components/ui';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

export interface FriendInCity {
  name: string;
  avatarUrl: string;
  placeCount: number;
  recentPlace?: string | null;
}

export interface CityCardProps {
  city: string;
  country: string;
  countryCode: string; // e.g., "us", "fr", "mx"
  friends: FriendInCity[];
  totalPlaces: number;
  onViewAll?: () => void;
  onFriendClick?: (friendName: string) => void;
}

export function CityCard({
  city,
  country,
  countryCode,
  friends,
  totalPlaces,
  onViewAll,
  onFriendClick,
}: CityCardProps) {
  const flagCode = countryCode.toLowerCase();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="location" size={20} color={colors.primary.blue} />
          <View style={styles.cityInfo}>
            <View style={styles.cityRow}>
              <H3>{city}</H3>
              {/* Flag */}
              <View style={styles.flagContainer}>
                <Image
                  source={{
                    uri: `https://flagcdn.com/w40/${flagCode}.png`,
                  }}
                  style={styles.flag}
                  resizeMode="cover"
                />
              </View>
            </View>
            <Caption color={colors.neutral[600]}>
              {totalPlaces} places from {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
            </Caption>
          </View>
        </View>

        {onViewAll && (
          <Pressable
            onPress={onViewAll}
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed && styles.viewAllButtonPressed,
            ]}
          >
            <Body color={colors.primary.blue} style={styles.viewAllText}>
              View All
            </Body>
            <Ionicons name="chevron-forward" size={16} color={colors.primary.blue} />
          </Pressable>
        )}
      </View>

      {/* Friends List */}
      <View style={styles.friendsList}>
        {friends.map((friend, idx) => (
          <Pressable
            key={idx}
            onPress={() => onFriendClick?.(friend.name)}
            style={({ pressed }) => [
              styles.friendItem,
              pressed && styles.friendItemPressed,
            ]}
          >
            <Image
              source={{ uri: friend.avatarUrl }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.friendInfo}>
              <Body weight="medium">{friend.name}</Body>
              <Caption color={colors.neutral[600]}>
                {friend.placeCount} places
                {friend.recentPlace && ` · ${friend.recentPlace}`}
              </Caption>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing[2],
  },
  cityInfo: {
    flex: 1,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  flagContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  flag: {
    width: '100%',
    height: '100%',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    minHeight: spacing.touchPreferred, // 48px
    justifyContent: 'center',
  },
  viewAllButtonPressed: {
    opacity: 0.6,
  },
  viewAllText: {
    fontWeight: '500',
  },
  friendsList: {
    gap: spacing[2],
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing[2],
    minHeight: spacing.touchPreferred, // 48px
  },
  friendItemPressed: {
    backgroundColor: colors.neutral[100],
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  friendInfo: {
    flex: 1,
  },
});
