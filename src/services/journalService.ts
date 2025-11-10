/**
 * Journal Service
 *
 * Processes places, trips, and homes into a chronological journal timeline
 * Adapted from web app for React Native
 */

import type { Place, Trip, Home } from '@/types/shared';

export type ActivityType =
  | 'visited'
  | 'wishlist'
  | 'endorsed'
  | 'trip_created'
  | 'home_added';

export interface JournalActivity {
  id: string;
  type: ActivityType;
  placeName?: string;
  placeCategory?: string;
  city: string;
  country: string;
  timestamp: string;
  tripName?: string;
  homeYears?: string;
}

export interface WeeklySummary {
  week_start: string;
  week_end: string;
  week_label: string;
  activities: JournalActivity[];
  stats: {
    places_added: number;
    trips_created: number;
    homes_added: number;
    endorsements_given: number;
    cities_explored: number;
    new_countries: Set<string>;
  };
}

export interface JournalStats {
  total_places: number;
  total_trips: number;
  total_homes: number;
  total_cities: number;
  total_countries: number;
  total_endorsements: number;
}

/**
 * Fetch all user activities from places, trips, and homes
 */
export function fetchUserActivities(
  places: Place[],
  trips: Trip[],
  homes: Home[]
): JournalActivity[] {
  const activities: JournalActivity[] = [];

  // Process places
  places.forEach(place => {
    // For now, we'll treat all places as "visited" since we don't have the marker system yet
    // In the future, this should check the marker_type from the reviews table
    activities.push({
      id: `place-${place.id}`,
      type: 'visited',
      placeName: place.name,
      placeCategory: place.category,
      city: place.city,
      country: place.country,
      timestamp: new Date().toISOString(), // TODO: Get actual created_at from database
      tripName: place.tripName,
      homeYears: place.homeYears,
    });
  });

  // Process trips
  trips.forEach(trip => {
    activities.push({
      id: `trip-${trip.id}`,
      type: 'trip_created',
      city: trip.city,
      country: trip.country,
      timestamp: trip.startDate.toISOString(),
      tripName: trip.name,
    });
  });

  // Process homes
  homes.forEach(home => {
    activities.push({
      id: `home-${home.id}`,
      type: 'home_added',
      city: home.city,
      country: home.country,
      timestamp: home.startDate,
      homeYears: home.endDate
        ? `${new Date(home.startDate).getFullYear()}-${new Date(home.endDate).getFullYear()}`
        : `${new Date(home.startDate).getFullYear()}-Present`,
    });
  });

  // Sort by timestamp (most recent first)
  return activities.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Group activities by week
 */
export function groupActivitiesByWeek(activities: JournalActivity[]): WeeklySummary[] {
  const weekMap = new Map<string, WeeklySummary>();

  activities.forEach(activity => {
    const activityDate = new Date(activity.timestamp);
    const weekStart = getWeekStart(activityDate);
    const weekEnd = getWeekEnd(weekStart);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        week_label: getWeekLabel(weekStart),
        activities: [],
        stats: {
          places_added: 0,
          trips_created: 0,
          homes_added: 0,
          endorsements_given: 0,
          cities_explored: 0,
          new_countries: new Set<string>(),
        },
      });
    }

    const week = weekMap.get(weekKey)!;
    week.activities.push(activity);

    // Update stats
    if (activity.type === 'visited' || activity.type === 'wishlist') {
      week.stats.places_added++;
    } else if (activity.type === 'endorsed') {
      week.stats.endorsements_given++;
    } else if (activity.type === 'trip_created') {
      week.stats.trips_created++;
    } else if (activity.type === 'home_added') {
      week.stats.homes_added++;
    }

    week.stats.new_countries.add(activity.country);
  });

  // Convert to array and calculate additional stats
  const summaries = Array.from(weekMap.values()).map(week => ({
    ...week,
    stats: {
      ...week.stats,
      cities_explored: new Set(week.activities.map(a => a.city)).size,
    },
  }));

  return summaries.sort((a, b) =>
    new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
  );
}

/**
 * Calculate overall journal statistics
 */
export function calculateJournalStats(
  places: Place[],
  trips: Trip[],
  homes: Home[]
): JournalStats {
  return {
    total_places: places.length,
    total_trips: trips.length,
    total_homes: homes.length,
    total_cities: new Set(places.map(p => p.city)).size,
    total_countries: new Set(places.map(p => p.country)).size,
    total_endorsements: 0, // TODO: Count endorsed places when marker system is implemented
  };
}

/**
 * Get the start of the week (Sunday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

/**
 * Get the end of the week (Saturday) for a given week start
 */
function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
}

/**
 * Get a human-readable label for a week
 */
function getWeekLabel(weekStart: Date): string {
  const now = new Date();
  const thisWeekStart = getWeekStart(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  if (weekStart.toDateString() === thisWeekStart.toDateString()) {
    return 'This Week';
  } else if (weekStart.toDateString() === lastWeekStart.toDateString()) {
    return 'Last Week';
  } else {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekEnd = getWeekEnd(weekStart);
    return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}`;
  }
}

/**
 * Get recent N activities
 */
export function getRecentActivities(
  activities: JournalActivity[],
  limit: number = 10
): JournalActivity[] {
  return activities.slice(0, limit);
}
