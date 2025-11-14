/**
 * Trip Detail Screen - GalliGo React Native
 *
 * Shows trip itinerary, places, photos, and collaborators
 */

import React from 'react';
import { View, ScrollView, Image, Pressable, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FullPageSpinner, H1, H2, Body, Caption, Avatar, Button } from '@/components/ui';
import { useTrips } from '@/lib/api-hooks';
import { getCountryCode } from '@/utils/countryUtils';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing, borderRadius, typography } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;

export function TripDetailScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const insets = useSafeAreaInsets();

  // Fetch all trips and find this one
  const { data: trips = [], isLoading } = useTrips();
  const trip = trips.find((t) => t.id === tripId);

  if (isLoading || !trip) {
    return <FullPageSpinner label="Loading trip..." />;
  }

  // Convert dates
  const startDate = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
  const endDate = trip.endDate instanceof Date ? trip.endDate : new Date(trip.endDate);

  // Calculate duration
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Format dates
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Get country flag
  const countryCode = getCountryCode(trip.country);
  const flagUrl = `https://flagcdn.com/w80/${countryCode}.png`;

  // Hero image
  const imageUrl = trip.heroImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            />

            {/* Back Button */}
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { top: insets.top + spacing[2] }]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <View style={styles.backButtonInner}>
                <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
              </View>
            </Pressable>

            {/* Trip Info Overlay */}
            <View style={[styles.heroContent, { paddingBottom: spacing[4] + insets.bottom }]}>
              <H1 style={styles.heroTitle}>{trip.name}</H1>

              <View style={styles.heroLocation}>
                <Image source={{ uri: flagUrl }} style={styles.heroFlag} resizeMode="cover" />
                <Body style={styles.heroLocationText}>
                  {trip.city}, {trip.country}
                </Body>
              </View>

              <Body style={styles.heroDate}>{dateRange}</Body>

              {/* Collaborators */}
              {trip.collaborators && trip.collaborators.length > 0 && (
                <View style={styles.heroCollaborators}>
                  {trip.collaborators.slice(0, 5).map((collab, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: collab.avatarUrl }}
                      style={[
                        styles.heroAvatar,
                        { marginLeft: idx > 0 ? -8 : 0, zIndex: 5 - idx },
                      ]}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              )}
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Overview */}
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>Overview</H2>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary.blue} />
                <Caption color={colors.text.secondary}>Duration</Caption>
                <Body weight="medium">{durationDays} days</Body>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="location-outline" size={20} color={colors.secondary.green} />
                <Caption color={colors.text.secondary}>Places</Caption>
                <Body weight="medium">{trip.places?.length || 0}</Body>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="people-outline" size={20} color={colors.brand.sunset} />
                <Caption color={colors.text.secondary}>Travelers</Caption>
                <Body weight="medium">{(trip.collaborators?.length || 0) + 1}</Body>
              </View>
            </View>
          </View>

          {/* Description */}
          {trip.description && (
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>About This Trip</H2>
              <Body color={colors.text.secondary} style={styles.paragraph}>
                {trip.description}
              </Body>
            </View>
          )}

          {/* Collaborators */}
          {trip.collaborators && trip.collaborators.length > 0 && (
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>Travelers</H2>
              {trip.collaborators.map((collab, idx) => (
                <View key={idx} style={styles.collaboratorItem}>
                  <Avatar
                    src={collab.avatarUrl}
                    initials={collab.name.substring(0, 2)}
                    size="md"
                  />
                  <Body weight="medium">{collab.name}</Body>
                </View>
              ))}
            </View>
          )}

          {/* Places */}
          {trip.places && trip.places.length > 0 && (
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>Places ({trip.places.length})</H2>
              {trip.places.map((place, idx) => (
                <Pressable
                  key={idx}
                  style={styles.placeItem}
                  onPress={() => {
                    if (place.id) {
                      navigation.navigate('PlaceDetail', { placeId: place.id });
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for ${place.name}`}
                  accessibilityHint="Opens place detail"
                >
                  <View style={styles.placeIconContainer}>
                    <Ionicons name="location" size={16} color={colors.primary.blue} />
                  </View>
                  <Body flex={1} numberOfLines={1}>
                    {place.name}
                  </Body>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                </Pressable>
              ))}
            </View>
          )}

          {/* Empty state for places */}
          {(!trip.places || trip.places.length === 0) && (
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>Places</H2>
              <View style={styles.emptyPlaces}>
                <Ionicons name="location-outline" size={48} color={colors.neutral[300]} />
                <Caption color={colors.text.secondary}>No places added yet</Caption>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => navigation.navigate('EditTrip', { tripId })}
                  accessibilityLabel="Add a new place to this trip"
                >
                  Add Place
                </Button>
              </View>
            </View>
          )}

          {/* Edit Action */}
          <View style={styles.actions}>
            <Button
              fullWidth
              onPress={() => navigation.navigate('EditTrip', { tripId })}
              accessibilityLabel="Edit this trip"
            >
              Edit Trip
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brand.warmBeige,
  },
  heroContainer: {
    width: '100%',
    height: 400,
  },
  heroImage: {
    flex: 1,
    width: '100%',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: spacing[4],
    left: spacing.pagePaddingMobile,
    zIndex: 10,
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
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.pagePaddingMobile,
    zIndex: 5,
  },
  heroTitle: {
    color: colors.primary.white,
    marginBottom: spacing[2],
    letterSpacing: -0.5,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  heroFlag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  heroLocationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  heroDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: spacing[3],
  },
  heroCollaborators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary.white,
  },
  content: {
    padding: spacing.pagePaddingMobile,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  paragraph: {
    marginTop: spacing[1],
    lineHeight: typography.lineHeight.body,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.brand.offWhite,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing[2],
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.brand.offWhite,
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  placeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPlaces: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[3],
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
});
