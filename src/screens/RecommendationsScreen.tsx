/**
 * Recommendations Screen - GalliGo React Native
 *
 * Discover personalized place recommendations from friends
 * Note: Using mock data until backend is implemented
 */

import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState, H1, H2, PlaceCard } from '@/components/ui';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing } = theme;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock recommendations data (will be replaced with real API later)
const MOCK_RECOMMENDATIONS = [
  {
    id: '1',
    name: 'Republique',
    category: 'restaurant',
    city: 'Los Angeles',
    country: 'USA',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    recommendationCount: 2,
  },
  {
    id: '2',
    name: 'Blue Bottle Coffee',
    category: 'coffee',
    city: 'Los Angeles',
    country: 'USA',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    recommendationCount: 1,
  },
  {
    id: '3',
    name: 'Griffith Observatory',
    category: 'sightseeing',
    city: 'Los Angeles',
    country: 'USA',
    imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856',
    recommendationCount: 3,
  },
];

export function RecommendationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for now
  const recommendations = MOCK_RECOMMENDATIONS;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.blue}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <H1>Recommendations</H1>
        </View>

        {/* Recommendations Section */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>For You</H2>

          {recommendations.length === 0 ? (
            <EmptyState
              icon="star-outline"
              title="No Recommendations Yet"
              description="Start adding friends to get personalized place recommendations!"
            />
          ) : (
            <View>
              {recommendations.map((place) => (
                <PlaceCard
                  key={place.id}
                  name={place.name}
                  category={place.category}
                  city={place.city}
                  country={place.country}
                  imageUrl={place.imageUrl}
                  recommendationCount={place.recommendationCount}
                  onPress={() => {
                    console.log('Place clicked:', place.id);
                    // TODO: Navigate to place detail
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Coming Soon Notice */}
        <View style={styles.comingSoon}>
          <EmptyState
            icon="construct-outline"
            description="More recommendation features coming soon! Including requests, wishlist, and more."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    paddingBottom: spacing[6],
  },
  header: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  section: {
    paddingHorizontal: spacing.pagePaddingMobile,
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  comingSoon: {
    paddingHorizontal: spacing.pagePaddingMobile,
    marginTop: spacing[8],
  },
});
