/**
 * Root Navigator - GalliGo React Native
 *
 * Main navigation structure with:
 * - Authentication flow (Login → Main Tabs)
 * - Bottom tab navigation for main screens
 * - Stack navigation for modals/detail views
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { LoginScreen } from '@/screens/LoginScreen';
import { TravelLogScreen as TravelLogScreenNew } from '@/screens/TravelLogScreenNew';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { MyTripsScreen } from '@/screens/MyTripsScreen';
import { RecommendationsScreen } from '@/screens/RecommendationsScreen';
import { CityDetailScreen } from '@/screens/CityDetailScreen';
import { TripDetailScreen } from '@/screens/TripDetailScreen';
import { PlaceDetailScreen } from '@/screens/PlaceDetailScreen';
import { CreateTripScreen } from '@/screens/CreateTripScreen';
import { EditTripScreen } from '@/screens/EditTripScreen';
import { UserProfileScreen } from '@/screens/UserProfileScreen';

// Auth
import { useAuth } from '@/lib/auth';
import { theme } from '@/theme';

const { colors, spacing } = theme;

// Type definitions for navigation
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  CityDetail: { cityName: string };
  TripDetail: { tripId: string };
  PlaceDetail: { placeId: string };
  CreateTrip: undefined;
  EditTrip: { tripId: string };
  UserProfile: undefined;
};

export type MainTabParamList = {
  Explore: undefined;
  Trips: undefined;
  Recs: undefined;
  Log: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Loading Screen
 * Shown while auth state is being determined
 */
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary.blue} />
    </View>
  );
}

/**
 * Main Tabs Navigator
 * Bottom tab navigation for 4 main screens
 */
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function MainTabs() {
  const insets = useSafeAreaInsets();
  // Standard tab bar height on iOS is ~49. Android is similar.
  // We add bottom inset for home indicator area.
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8, // Add padding for home indicator or small padding on old devices
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
          backgroundColor: colors.primary.white,
        },
        tabBarActiveTintColor: colors.primary.blue,
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: -4,
          marginBottom: insets.bottom > 0 ? 0 : 4, // Adjust label spacing if no home indicator
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Trips"
        component={MyTripsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="airplane-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Recs"
        component={RecommendationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Log"
        component={TravelLogScreenNew}
        options={{
          tabBarLabel: 'Travel Log',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="globe-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator
 * Main navigation container with authentication flow
 */
export function RootNavigator() {
  const { user, loading } = useAuth();

  // Show loading screen while determining auth state
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.neutral[50] },
        }}
      >
        {!user ? (
          // Unauthenticated stack
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // Authenticated stack
          <>
            <Stack.Screen name="Main" component={MainTabs} />

            {/* Detail Screens */}
            <Stack.Screen
              name="CityDetail"
              component={CityDetailScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="TripDetail"
              component={TripDetailScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="PlaceDetail"
              component={PlaceDetailScreen}
              options={{ presentation: 'card' }}
            />

            {/* Modal Screens */}
            <Stack.Screen
              name="CreateTrip"
              component={CreateTripScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="EditTrip"
              component={EditTripScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
});
