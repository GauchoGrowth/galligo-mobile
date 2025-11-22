/**
 * My Trips Screen - GalliGo React Native
 *
 * View and manage your travel trips
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FullPageSpinner, EmptyState, H1, Caption } from '@/components/ui';
import { TripCard } from '@/components/trips/TripCard';
import { useTrips } from '@/lib/api-hooks';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing } = theme;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabValue = 'upcoming' | 'past';

export function MyTripsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTab, setSelectedTab] = useState<TabValue>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Fetch trips data
  const { data: trips = [], isLoading, refetch } = useTrips();

  // Separate trips into upcoming and past
  const { upcomingTrips, pastTrips } = useMemo(() => {
    const now = new Date();
    const upcoming = trips.filter((trip) => {
      const startDate = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
      return startDate >= now;
    });
    const past = trips.filter((trip) => {
      const startDate = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
      return startDate < now;
    });

    // Sort upcoming by start date (earliest first)
    upcoming.sort((a, b) => {
      const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
      const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
      return dateA.getTime() - dateB.getTime();
    });

    // Sort past by start date (most recent first)
    past.sort((a, b) => {
      const dateA = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
      const dateB = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
      return dateB.getTime() - dateA.getTime();
    });

    return { upcomingTrips: upcoming, pastTrips: past };
  }, [trips]);

  // Get active trips list
  const activeTrips = selectedTab === 'upcoming' ? upcomingTrips : pastTrips;

  useEffect(() => {
    // Debug lengths; keep for troubleshooting
    console.log('[MyTripsScreen] tabs lengths', {
      selectedTab,
      upcoming: upcomingTrips.length,
      past: pastTrips.length,
      active: activeTrips.length,
    });
  }, [selectedTab, upcomingTrips.length, pastTrips.length, activeTrips.length]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Scroll to top when switching tabs so content is visible
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [selectedTab]);

  const renderTabs = useCallback(() => (
    <View style={styles.tabs}>
      <Pressable
        onPress={() => setSelectedTab('upcoming')}
        style={[
          styles.tab,
          selectedTab === 'upcoming' && styles.tabActive,
        ]}
      >
        <Ionicons
          name="airplane"
          size={16}
          color={selectedTab === 'upcoming' ? colors.primary.blue : colors.neutral[600]}
        />
        <Caption
          style={
            selectedTab === 'upcoming'
              ? [styles.tabText, styles.tabTextActive]
              : styles.tabText
          }
        >
          Upcoming ({upcomingTrips.length})
        </Caption>
      </Pressable>

      <Pressable
        onPress={() => setSelectedTab('past')}
        style={[
          styles.tab,
          selectedTab === 'past' && styles.tabActive,
        ]}
      >
        <Ionicons
          name="time"
          size={16}
          color={selectedTab === 'past' ? colors.primary.blue : colors.neutral[600]}
        />
        <Caption
          style={
            selectedTab === 'past'
              ? [styles.tabText, styles.tabTextActive]
              : styles.tabText
          }
        >
          Past ({pastTrips.length})
        </Caption>
      </Pressable>
    </View>
  ), [selectedTab, upcomingTrips.length, pastTrips.length]);

  const renderTrip: ListRenderItem<typeof activeTrips[number]> = ({ item, index }) => {
    // Debug log to confirm render
    console.log('[MyTripsScreen] renderTrip', selectedTab, index, item.name);
    return (
      <View style={styles.cardWrapper}>
        <TripCard
          key={item.id}
          trip={item}
          onPress={() => {
            navigation.navigate('TripDetail', { tripId: item.id });
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.listSpacer} />
      {isLoading ? (
        <FullPageSpinner label="Loading your trips..." />
      ) : (
        <FlatList
          style={styles.list}
          ref={listRef}
          data={activeTrips}
          renderItem={renderTrip}
          keyExtractor={(item) => item.id}
          extraData={selectedTab}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <H1>My Trips</H1>
              </View>
              {renderTabs()}
            </View>
          }
          initialNumToRender={10}
          removeClippedSubviews={false}
          ListFooterComponent={<View style={styles.listFooter} />}
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <EmptyState
                icon={selectedTab === 'upcoming' ? 'airplane-outline' : 'time-outline'}
                title={selectedTab === 'upcoming' ? 'No Upcoming Trips' : 'No Past Trips'}
                description={
                  selectedTab === 'upcoming'
                    ? 'Start planning your next adventure!'
                    : 'Your completed trips will appear here.'
                }
                actionLabel={selectedTab === 'upcoming' ? 'Plan a Trip' : undefined}
                onAction={selectedTab === 'upcoming' ? () => {
                  navigation.navigate('CreateTrip');
                } : undefined}
              />
            </View>
          }
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}

      {/* Floating Add Button */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          navigation.navigate('CreateTrip');
        }}
      >
        <Ionicons name="add" size={28} color={colors.primary.white} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingBottom: spacing[20],
    paddingTop: spacing[2],
    flexGrow: 1,
  },
  listSpacer: {
    height: spacing[2],
  },
  listFooter: {
    height: spacing[10],
  },
  cardWrapper: {
    marginBottom: spacing[4],
  },
  header: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingTop: spacing[5],
    paddingBottom: spacing[2],
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing.pagePaddingMobile,
    marginBottom: spacing[4],
  },
  emptyWrapper: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingTop: spacing[6],
  },
  debugCount: {
    color: colors.neutral[500],
    marginTop: spacing[1],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  tabActive: {
    backgroundColor: colors.primary.blue + '10',
    borderColor: colors.primary.blue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  tabTextActive: {
    color: colors.primary.blue,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: spacing[8],
    right: spacing.pagePaddingMobile,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for iOS
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 8,
  },
});
