/**
 * Place Detail Screen - GalliGo React Native
 *
 * Shows detailed information about a specific place
 */

import React from 'react';
import { View, ScrollView, Image, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FullPageSpinner, H1, H2, Body, Caption, Avatar } from '@/components/ui';
import { usePlaces, usePlaceDetails } from '@/lib/api-hooks';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing, borderRadius } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: 'restaurant',
  coffee: 'cafe',
  activity: 'bicycle',
  hotel: 'bed',
  sightseeing: 'camera',
  shopping: 'cart',
  nightlife: 'musical-notes',
};

export function PlaceDetailScreen({ route, navigation }: Props) {
  const { placeId } = route.params;

  // Fetch place details
  const { data: placeDetails, isLoading } = usePlaceDetails(placeId);
  const { data: allPlaces = [] } = usePlaces();

  // Get basic place info from list
  const place = allPlaces.find((p) => p.id === placeId);

  if (isLoading || !place) {
    return <FullPageSpinner label="Loading place..." />;
  }

  const iconName = CATEGORY_ICONS[place.category] || 'location';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {place.imageUrl ? (
            <Image
              source={{ uri: place.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name={iconName} size={64} color={colors.neutral[400]} />
            </View>
          )}

          {/* Back Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={8}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
            </View>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.categoryBadge}>
              <Ionicons name={iconName} size={16} color={colors.primary.blue} />
              <Caption color={colors.primary.blue} style={styles.categoryText}>
                {place.category}
              </Caption>
            </View>

            <H1 style={styles.title}>{place.name}</H1>

            <View style={styles.location}>
              <Ionicons name="location-outline" size={16} color={colors.neutral[600]} />
              <Body color={colors.neutral[600]}>
                {place.city}, {place.country}
              </Body>
            </View>
          </View>

          {/* Friend Activity */}
          {placeDetails?.friendActivity && placeDetails.friendActivity.length > 0 && (
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>Friend Activity</H2>
              {placeDetails.friendActivity.map((activity, idx) => (
                <View key={idx} style={styles.activityItem}>
                  <Avatar
                    src={activity.friend_avatar_url}
                    initials={activity.friend_name.substring(0, 2)}
                    size="md"
                  />
                  <View style={styles.activityContent}>
                    <Body weight="medium">{activity.friend_name}</Body>
                    {activity.status && (
                      <Caption color={colors.neutral[600]}>
                        {activity.status === 'visited' && '✓ Visited'}
                        {activity.status === 'wishlist' && '⭐ Wishlist'}
                        {activity.status === 'endorsed' && '❤️ Endorsed'}
                      </Caption>
                    )}
                    {activity.review && (
                      <Body color={colors.neutral[700]} style={styles.review}>
                        "{activity.review}"
                      </Body>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Your Review */}
          {placeDetails?.userReview ? (
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>Your Review</H2>
              <View style={styles.userReviewCard}>
                <View style={styles.statusRow}>
                  <Caption color={colors.neutral[700]}>Status:</Caption>
                  <Caption color={colors.primary.blue} weight="medium">
                    {placeDetails.userReview.status === 'visited' && '✓ Visited'}
                    {placeDetails.userReview.status === 'wishlist' && '⭐ Wishlist'}
                    {placeDetails.userReview.status === 'endorsed' && '❤️ Endorsed'}
                  </Caption>
                </View>
                {placeDetails.userReview.review && (
                  <Body style={styles.userReviewText}>
                    {placeDetails.userReview.review}
                  </Body>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <Pressable
                style={styles.addReviewButton}
                onPress={() => {
                  console.log('Add review');
                  // TODO: Open add review modal
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary.blue} />
                <Body color={colors.primary.blue} weight="medium">
                  Add Your Review
                </Body>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.white,
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: spacing[4],
    left: spacing.pagePaddingMobile,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: spacing.pagePaddingMobile,
  },
  header: {
    marginBottom: spacing[6],
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary.blue + '15',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing[3],
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    marginBottom: spacing[2],
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  activityItem: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  activityContent: {
    flex: 1,
    gap: spacing[1],
  },
  review: {
    fontStyle: 'italic',
    marginTop: spacing[1],
  },
  userReviewCard: {
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  userReviewText: {
    marginTop: spacing[2],
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary.blue + '10',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.blue,
  },
});
