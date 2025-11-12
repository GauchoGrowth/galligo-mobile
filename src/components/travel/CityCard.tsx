/**
 * CityCard Component - GalliGo React Native
 * Redesigned with hero imagery and analog film aesthetic
 */

import React from 'react';
import { View, Pressable, Image, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CityImage } from './CityImage';
import { theme } from '@/theme';

const { colors, spacing, borderRadius, shadows } = theme;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  index?: number;
}

export function CityCard({
  city,
  country,
  countryCode,
  friends,
  totalPlaces,
  onViewAll,
  index = 0,
}: CityCardProps) {
  const flagCode = countryCode.toLowerCase();

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 80).springify()}
      onPress={() => {
        if (onViewAll) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onViewAll();
        }
      }}
      style={styles.card}
      accessible={true}
      accessibilityLabel={`${city}, ${country}. ${totalPlaces} places from ${friends.length} friends. Tap to view all`}
      accessibilityRole="button"
    >
      {/* Hero Container with City Image */}
      <View style={styles.heroContainer}>
        <CityImage
          city={city}
          country={country}
          style={styles.heroImage}
          borderRadiusSize="xl"
        />

        {/* Gradient Overlay for Text */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.65)']}
          locations={[0.4, 1]}
          style={styles.heroGradient}
        >
          {/* City Info Overlaid on Image */}
          <View style={styles.cityHeader}>
            <Text style={styles.cityName}>{city}</Text>
            <Image
              source={{ uri: `https://flagcdn.com/w40/${flagCode}.png` }}
              style={styles.flag}
              accessible={false}
            />
          </View>

          <Text style={styles.placeCount}>
            {totalPlaces} {totalPlaces === 1 ? 'place' : 'places'} from {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
          </Text>
        </LinearGradient>
      </View>

      {/* Friends Row Below Image */}
      <View style={styles.friendsRow}>
        <View style={styles.avatarsContainer}>
          {friends.slice(0, 3).map((friend, idx) => (
            <Image
              key={idx}
              source={{ uri: friend.avatarUrl }}
              style={[
                styles.friendAvatar,
                idx > 0 && { marginLeft: -12 },
              ]}
              accessible={false}
            />
          ))}
          {friends.length > 3 && (
            <View style={[styles.moreAvatar, { marginLeft: -12 }]}>
              <Text style={styles.moreText}>+{friends.length - 3}</Text>
            </View>
          )}
        </View>

        <View style={styles.viewAllIndicator}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primary.blue} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[4],
    overflow: 'hidden',
    ...shadows[2],
  },
  heroContainer: {
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral[200],
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: spacing[4],
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  cityName: {
    color: colors.primary.white,
    fontSize: 28,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  flag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  placeCount: {
    color: colors.primary.white,
    fontSize: 13,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary.white,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.primary.white,
    backgroundColor: colors.neutral[100],
  },
  moreAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[200],
    borderWidth: 3,
    borderColor: colors.primary.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  viewAllIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.blue,
  },
});
