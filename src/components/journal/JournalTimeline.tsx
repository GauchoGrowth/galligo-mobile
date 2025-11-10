/**
 * JournalTimeline Component
 *
 * Displays chronological timeline of user activities grouped by week
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Body, BodyLarge, BodySmall, H2, H3 } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import type { WeeklySummary, JournalActivity } from '@/services/journalService';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

interface JournalTimelineProps {
  weeklySummaries: WeeklySummary[];
}

export function JournalTimeline({ weeklySummaries }: JournalTimelineProps) {
  if (weeklySummaries.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={48} color={colors.neutral[400]} />
        <BodyLarge color={colors.neutral[600]} align="center" style={styles.emptyText}>
          No activity yet
        </BodyLarge>
        <BodySmall color={colors.neutral[500]} align="center">
          Start adding places to see your journal
        </BodySmall>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {weeklySummaries.map((week, index) => (
        <WeekSection key={week.week_start} week={week} isFirst={index === 0} />
      ))}
    </ScrollView>
  );
}

interface WeekSectionProps {
  week: WeeklySummary;
  isFirst: boolean;
}

function WeekSection({ week, isFirst }: WeekSectionProps) {
  const newCountries = week.stats.new_countries.size;

  return (
    <View style={[styles.weekSection, isFirst && styles.weekSectionFirst]}>
      {/* Week Header */}
      <View style={styles.weekHeader}>
        <H3 weight="bold">
          {week.week_label}
        </H3>
        <BodySmall color={colors.neutral[600]}>
          {week.activities.length} {week.activities.length === 1 ? 'activity' : 'activities'}
        </BodySmall>
      </View>

      {/* Week Stats */}
      {(week.stats.places_added > 0 || newCountries > 0) && (
        <View style={styles.statsRow}>
          {week.stats.places_added > 0 && (
            <View style={[styles.statBadge, { backgroundColor: colors.primary.blue + '20' }]}>
              <BodySmall weight="medium" color={colors.primary.blue}>
                {week.stats.places_added} {week.stats.places_added === 1 ? 'place' : 'places'}
              </BodySmall>
            </View>
          )}
          {newCountries > 0 && (
            <View style={[styles.statBadge, { backgroundColor: colors.secondary.green + '20' }]}>
              <BodySmall weight="medium" color={colors.secondary.green}>
                {newCountries} new {newCountries === 1 ? 'country' : 'countries'}!
              </BodySmall>
            </View>
          )}
        </View>
      )}

      {/* Activities */}
      <View style={styles.activities}>
        {week.activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </View>
    </View>
  );
}

interface ActivityItemProps {
  activity: JournalActivity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = (type: JournalActivity['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'visited':
        return 'location';
      case 'wishlist':
        return 'bookmark';
      case 'endorsed':
        return 'heart';
      case 'trip_created':
        return 'airplane';
      case 'home_added':
        return 'home';
      default:
        return 'location';
    }
  };

  const getActivityText = () => {
    switch (activity.type) {
      case 'visited':
        return `Added ${activity.placeName}`;
      case 'wishlist':
        return `Saved ${activity.placeName} to wishlist`;
      case 'endorsed':
        return `Recommended ${activity.placeName}`;
      case 'trip_created':
        return `Created trip to ${activity.city}`;
      case 'home_added':
        return `Added home in ${activity.city}`;
      default:
        return activity.placeName || 'Activity';
    }
  };

  const getActivityColor = (type: JournalActivity['type']): string => {
    switch (type) {
      case 'visited':
        return colors.primary.blue;
      case 'wishlist':
        return colors.secondary.purple;
      case 'endorsed':
        return colors.secondary.green;
      case 'trip_created':
        return colors.secondary.ocean;
      case 'home_added':
        return colors.secondary.yellow;
      default:
        return colors.neutral[600];
    }
  };

  const iconName = getActivityIcon(activity.type);
  const iconColor = getActivityColor(activity.type);

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>
      <View style={styles.activityContent}>
        <Body weight="medium">{getActivityText()}</Body>
        <BodySmall color={colors.neutral[600]}>
          {activity.city}, {activity.country}
        </BodySmall>
        {activity.placeCategory && (
          <BodySmall color={colors.neutral[500]} style={styles.category}>
            {activity.placeCategory}
          </BodySmall>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing[8],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[6],
  },
  emptyText: {
    marginTop: spacing[3],
  },
  weekSection: {
    marginTop: spacing[6],
    paddingHorizontal: spacing.pagePaddingMobile,
  },
  weekSectionFirst: {
    marginTop: spacing[3],
  },
  weekHeader: {
    marginBottom: spacing[2],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
    flexWrap: 'wrap',
  },
  statBadge: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.md,
  },
  activities: {
    gap: spacing[2],
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: spacing[3],
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  category: {
    marginTop: spacing[1],
    textTransform: 'capitalize',
  },
});
