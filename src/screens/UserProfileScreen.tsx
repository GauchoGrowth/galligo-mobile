/**
 * User Profile Screen - GalliGo React Native
 *
 * User profile, settings, and logout
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { H1, H2, Body, Caption, Avatar, FullPageSpinner } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useUserProfile, usePlaces, useTrips } from '@/lib/api-hooks';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing, borderRadius } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export function UserProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useUserProfile();
  const { data: places = [] } = usePlaces();
  const { data: trips = [] } = useTrips();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // Navigation will happen automatically via AuthProvider
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <FullPageSpinner label="Loading profile..." />;
  }

  // Get stats
  const uniqueCities = new Set(places.map((p) => p.city)).size;
  const uniqueCountries = new Set(places.map((p) => p.country)).size;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={28} color={colors.neutral[900]} />
        </Pressable>
        <H1 style={styles.title}>Profile</H1>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar
            src={profile?.avatar_url}
            initials={profile?.display_name?.substring(0, 2) || user?.email?.substring(0, 2) || '?'}
            size="xl"
          />
          <H2 style={styles.displayName}>
            {profile?.display_name || user?.email?.split('@')[0] || 'User'}
          </H2>
          <Caption color={colors.neutral[600]}>{user?.email}</Caption>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <H2>{places.length}</H2>
            <Caption color={colors.neutral[600]}>Places</Caption>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <H2>{uniqueCities}</H2>
            <Caption color={colors.neutral[600]}>Cities</Caption>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <H2>{uniqueCountries}</H2>
            <Caption color={colors.neutral[600]}>Countries</Caption>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <H2>{trips.length}</H2>
            <Caption color={colors.neutral[600]}>Trips</Caption>
          </View>
        </View>

        {/* Bio */}
        {profile?.bio && (
          <View style={styles.section}>
            <Body color={colors.neutral[700]}>{profile.bio}</Body>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Caption color={colors.neutral[600]} style={styles.sectionHeader}>
            SETTINGS
          </Caption>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              console.log('Edit profile');
              // TODO: Navigate to edit profile
            }}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-outline" size={20} color={colors.neutral[700]} />
            </View>
            <Body flex={1}>Edit Profile</Body>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              console.log('Notifications');
              // TODO: Navigate to notifications settings
            }}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications-outline" size={20} color={colors.neutral[700]} />
            </View>
            <Body flex={1}>Notifications</Body>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              console.log('Privacy');
              // TODO: Navigate to privacy settings
            }}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="shield-outline" size={20} color={colors.neutral[700]} />
            </View>
            <Body flex={1}>Privacy</Body>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Pressable>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Caption color={colors.neutral[600]} style={styles.sectionHeader}>
            ABOUT
          </Caption>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="help-circle-outline" size={20} color={colors.neutral[700]} />
            </View>
            <Body flex={1}>Help & Support</Body>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="document-text-outline" size={20} color={colors.neutral[700]} />
            </View>
            <Body flex={1}>Terms of Service</Body>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.neutral[700]} />
            </View>
            <Body flex={1}>Privacy Policy</Body>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Body color={colors.error} weight="medium">
            Log Out
          </Body>
        </Pressable>

        {/* Version */}
        <Caption color={colors.neutral[500]} align="center" style={styles.version}>
          GalliGo v1.0.0
        </Caption>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.primary.white,
  },
  title: {
    fontSize: 20,
  },
  content: {
    paddingBottom: spacing[8],
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing.pagePaddingMobile,
    backgroundColor: colors.primary.white,
    marginBottom: spacing[4],
  },
  displayName: {
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  statsSection: {
    flexDirection: 'row',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing.pagePaddingMobile,
    backgroundColor: colors.primary.white,
    marginBottom: spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.neutral[200],
  },
  section: {
    backgroundColor: colors.primary.white,
    marginBottom: spacing[4],
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[4],
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    marginRight: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  version: {
    marginTop: spacing[6],
  },
});
