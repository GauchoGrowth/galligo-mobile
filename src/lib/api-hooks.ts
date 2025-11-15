import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import type { Place, CuratedList, Trip, Home, TimelineItem } from '@/types/shared';
import { supabase } from './supabase';
import {
  mockFriendsNetwork,
  mockHomes,
  mockLists,
  mockPlaces,
  mockTimelineItems,
  mockTrips,
  mockUserProfile,
} from './mockData';
import { useAuth } from './auth';

// Use environment variable or fallback to localhost
// In production, this would be your deployed backend URL
const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';

const resolveHostFromExpo = () => {
  const expoConfigHost = Constants.expoConfig?.hostUri;
  const manifestHost = (Constants as any)?.manifest?.debuggerHost;
  const manifest2Host = (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
  const expoHost = expoConfigHost || manifestHost || manifest2Host;

  if (!expoHost) return null;
  return expoHost.split(':')[0];
};

const resolveApiBase = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    const sanitized = process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
    return `${sanitized}/api`;
  }

  const hostFromExpo = resolveHostFromExpo();
  if (hostFromExpo) {
    return `http://${hostFromExpo}:8080/api`;
  }

  return 'http://localhost:8080/api';
};

const API_BASE = resolveApiBase();

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

// Places hooks
export function usePlaces() {
  const { user } = useAuth();

  return useQuery<Place[]>({
    queryKey: ['places', user?.id],
    queryFn: async () => {
      try {
        if (!user) return [];

        console.log('[usePlaces] Fetching places for user:', user.id);
        console.log('[usePlaces] Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

        // Query places through the reviews table
        const { data, error } = await supabase
          .from('reviews')
          .select('place_id, places(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching places:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          console.error('Error message:', error.message);
          console.error('Error code:', error.code);
          throw error;
        }

        console.log('[usePlaces] Fetched places successfully, count:', data?.length || 0);

        // Extract and map places from the join result
        const places = data
          ?.filter(review => review.places)
          .map((review: any) => {
            const place = review.places;
            const validCategories = ['restaurant', 'coffee', 'activity', 'hotel', 'sightseeing', 'shopping', 'nightlife'];
            const category = validCategories.includes(place.category) ? place.category : 'restaurant';

            return {
              id: place.id,
              name: place.display_name || place.name || '',
              city: place.city || '',
              country: place.country || '',
              category,
              note: place.notes || undefined,
              organized: place.organized || false,
              context: place.context as 'trip' | 'home' | undefined,
              tripName: place.trip_name || undefined,
              homeYears: place.home_years || undefined,
              lists: [], // TODO: Fetch list_places associations
            } as Place;
          }) || [];

        return places;
      } catch (err) {
        console.error('[usePlaces] Exception caught:', err);
        console.error('[usePlaces] Exception type:', typeof err);
        console.error('[usePlaces] Exception stringified:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
        if (USE_MOCK_DATA) {
          console.warn('[usePlaces] Falling back to mock data');
          return mockPlaces;
        }
        throw err;
      }
    },
    enabled: !!user,
  });
}

export function useLists() {
  const { user } = useAuth();

  return useQuery<CuratedList[]>({
    queryKey: ['lists', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching lists:', error);
          if (USE_MOCK_DATA) {
            console.warn('[useLists] Falling back to mock data');
            return mockLists;
          }
          return [];
        }

        return (
          data?.map(list => {
            const validColors = ['amber', 'purple', 'emerald', 'blue', 'pink', 'teal'];
            const color = validColors.includes(list.color) ? list.color : 'blue';

            return {
              id: list.id,
              name: list.name,
              emoji: list.emoji || '📍',
              description: list.description || '',
              color: color as any,
              userId: list.user_id,
            } as CuratedList;
          }) || []
        );
      } catch (error) {
        console.error('[useLists] Exception fetching lists:', error);
        if (USE_MOCK_DATA) {
          console.warn('[useLists] Falling back to mock data');
          return mockLists;
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}

export function useTrips() {
  const { user } = useAuth();

  return useQuery<Trip[]>({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('created_by', user.id)
          .order('start_date', { ascending: true });

        if (error) {
          console.error('Error fetching trips:', error);
          if (USE_MOCK_DATA) {
            console.warn('[useTrips] Falling back to mock data');
            return mockTrips;
          }
          return [];
        }

        return (
          data?.map(trip => {
            const now = new Date();
            const endDate = new Date(trip.end_date);
            const isPast = endDate < now;

            return {
              id: trip.id,
              name: trip.name,
              city: trip.city || '',
              country: trip.country || '',
              flag: '',
              imageUrl: trip.image || '',
              startDate: new Date(trip.start_date),
              endDate: endDate,
              collaborators: [],
              isPast,
              tips: trip.tips,
            } as Trip;
          }) || []
        );
      } catch (error) {
        console.error('[useTrips] Exception fetching trips:', error);
        if (USE_MOCK_DATA) {
          console.warn('[useTrips] Falling back to mock data');
          return mockTrips;
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trip: Partial<Trip>) => {
      const response = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      if (!response.ok) throw new Error('Failed to create trip');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'trips'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'timeline'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Trip> & { id: string }) => {
      const response = await fetch(`${API_BASE}/trips/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update trip');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'trips'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'timeline'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/trips/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete trip');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'trips'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'timeline'] });
    },
  });
}

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery<UserProfile>({
    queryKey: ['user', 'profile', user?.id],
    queryFn: async () => {
      if (!user) return {} as UserProfile;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error || !data) {
          console.error('Error fetching user profile:', error);
          if (USE_MOCK_DATA) {
            console.warn('[useUserProfile] Falling back to mock profile');
            return mockUserProfile;
          }
          return {
            id: user.id,
            email: user.email || '',
            display_name: user.email || '',
            avatar_url: undefined,
            bio: '',
          };
        }

        return {
          id: data.id,
          email: user.email || '',
          display_name: data.full_name,
          avatar_url: data.avatar_url,
          bio: data.bio,
        };
      } catch (error) {
        console.error('[useUserProfile] Exception fetching profile:', error);
        if (USE_MOCK_DATA) {
          console.warn('[useUserProfile] Falling back to mock profile');
          return mockUserProfile;
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}

export interface FriendsNetwork {
  friends: Array<{
    id: string;
    userId: string;
    name: string;
    avatarUrl: string;
    friendsSince: string;
    placeCount: number;
  }>;
  cities: Array<{
    city: string;
    country: string;
    friends: Array<{
      userId: string;
      name: string;
      avatarUrl: string;
      placeCount: number;
    }>;
    places: Array<{
      id: string;
      name: string;
      category: string;
      friendId: string;
      friendName: string;
    }>;
    totalPlaces: number;
  }>;
  totalPlaces: number;
  totalCities: number;
}

export function useFriendsNetwork() {
  const { user } = useAuth();

  return useQuery<FriendsNetwork>({
    queryKey: ['friends', 'network', user?.id],
    queryFn: async () => {
      try {
        console.log('[useFriendsNetwork] Starting query for user:', user?.id);

        if (!user) {
          console.log('[useFriendsNetwork] No user, returning empty');
          return {
            friends: [],
            cities: [],
            totalPlaces: 0,
            totalCities: 0,
          };
        }

        console.log('[useFriendsNetwork] Fetching friend connections...');
        // Get all accepted friend connections
        console.log('[useFriendsNetwork] Executing Supabase query...');
        const { data: connections, error: connectionsError } = await supabase
          .from('friend_connections')
          .select('id, user_id, friend_id, status, created_at')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted');
        console.log('[useFriendsNetwork] Supabase query resolved');

        if (connectionsError) {
          console.error('[useFriendsNetwork] Error fetching connections:', connectionsError);
          console.error('[useFriendsNetwork] Error details:', JSON.stringify(connectionsError, null, 2));
          throw connectionsError;
        }

        if (!connections || connections.length === 0) {
          console.log('[useFriendsNetwork] No friends found, returning empty');
          return {
            friends: [],
            cities: [],
            totalPlaces: 0,
            totalCities: 0,
          };
        }

        console.log('[useFriendsNetwork] Found', connections.length, 'friend connections');

        // Get friend IDs
        const friendIds = connections.map(conn =>
          conn.user_id === user.id ? conn.friend_id : conn.user_id
        );

      // Fetch friend profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', friendIds);

      // Get friends' endorsed places
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('user_id, place_id, places(id, display_name, city, country, category)')
        .in('user_id', friendIds)
        .eq('status', 'endorsed');

      // Build friends list with place counts
      const friendPlacesCount: Record<string, number> = {};
      reviewsData?.forEach(review => {
        friendPlacesCount[review.user_id] = (friendPlacesCount[review.user_id] || 0) + 1;
      });

      const friends = connections.map(connection => {
        const friendId = connection.user_id === user.id ? connection.friend_id : connection.user_id;
        const friendProfile = profiles?.find(p => p.id === friendId);

        return {
          id: connection.id,
          userId: friendProfile?.id || friendId,
          name: friendProfile?.full_name || 'Unknown',
          avatarUrl: friendProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/png?seed=${friendId}`,
          friendsSince: connection.created_at,
          placeCount: friendPlacesCount[friendId] || 0,
        };
      });

      // Organize places by city
      const citiesMap: Record<string, any> = {};
      reviewsData?.forEach(review => {
        const place = (review as any).places;
        if (!place || !place.city) return;

        const friendId = review.user_id;
        const friend = friends.find(f => f.userId === friendId);
        if (!friend) return;

        if (!citiesMap[place.city]) {
          citiesMap[place.city] = {
            city: place.city,
            country: place.country,
            friends: [],
            places: [],
            totalPlaces: 0,
          };
        }

        citiesMap[place.city].totalPlaces++;
        citiesMap[place.city].places.push({
          id: place.id,
          name: place.display_name,
          category: place.category,
          friendId: friendId,
          friendName: friend.name,
        });

        if (!citiesMap[place.city].friends.find((f: any) => f.userId === friendId)) {
          citiesMap[place.city].friends.push({
            userId: friendId,
            name: friend.name,
            avatarUrl: friend.avatarUrl,
            placeCount: 0,
          });
        }
      });

      // Calculate place count per friend per city
      Object.values(citiesMap).forEach((cityData: any) => {
        cityData.friends.forEach((friend: any) => {
          friend.placeCount = cityData.places.filter((p: any) => p.friendId === friend.userId).length;
        });
      });

        const cities = Object.values(citiesMap).sort((a: any, b: any) => b.totalPlaces - a.totalPlaces);

        console.log('[useFriendsNetwork] Successfully built network data:', {
          friendsCount: friends.length,
          citiesCount: cities.length,
          totalPlaces: reviewsData?.length || 0
        });

        return {
          friends,
          cities,
          totalPlaces: reviewsData?.length || 0,
          totalCities: cities.length,
        };
      } catch (err) {
        console.error('[useFriendsNetwork] Exception:', err);
        if (USE_MOCK_DATA) {
          console.warn('[useFriendsNetwork] Falling back to mock data');
          return mockFriendsNetwork;
        }
        throw err;
      }
    },
    enabled: !!user,
    retry: 1, // Reduce retries for faster debugging
    retryDelay: 1000,
  });
}

// Homes hooks
export function useHomes() {
  const { user } = useAuth();

  return useQuery<Home[]>({
    queryKey: ['homes', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('homes')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (error) {
          console.error('Error fetching homes:', error);
          if (USE_MOCK_DATA) {
            console.warn('[useHomes] Falling back to mock data');
            return mockHomes;
          }
          return [];
        }

        return (
          data?.map(home => ({
            id: home.id,
            city: home.city,
            country: home.country,
            adminDivision: home.admin_division || undefined,
            adminDivisionCode: home.admin_division_code || undefined,
            countryCode: home.country_code || undefined,
            latitude: home.latitude || undefined,
            longitude: home.longitude || undefined,
            startDate: home.start_date,
            endDate: home.end_date || undefined,
            status: home.status as 'current' | 'past',
            userId: home.user_id,
            createdAt: home.created_at,
            updatedAt: home.updated_at,
            tips: home.tips || undefined,
            favorites: home.favorites || undefined,
          })) || []
        );
      } catch (error) {
        console.error('[useHomes] Exception fetching homes:', error);
        if (USE_MOCK_DATA) {
          console.warn('[useHomes] Falling back to mock data');
          return mockHomes;
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}

export function useCreateHome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (home: Partial<Home>) => {
      const response = await fetch(`${API_BASE}/homes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(home),
      });
      if (!response.ok) throw new Error('Failed to create home');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'timeline'] });
    },
  });
}

export function useUpdateHome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Home> & { id: string }) => {
      const response = await fetch(`${API_BASE}/homes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update home');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'timeline'] });
    },
  });
}

export function useDeleteHome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/homes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete home');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'timeline'] });
    },
  });
}

// Timeline hook
export function useTimeline() {
  const { user } = useAuth();

  return useQuery<TimelineItem[]>({
    queryKey: ['timeline', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // Get all trips and homes
        const [tripsData, homesData] = await Promise.all([
          supabase
            .from('trips')
            .select('*')
            .eq('created_by', user.id)
            .order('start_date', { ascending: true }),
          supabase
            .from('homes')
            .select('*')
            .eq('user_id', user.id)
            .order('start_date', { ascending: false }),
        ]);

        const trips = tripsData.data || [];
        const homes = homesData.data || [];

        const timelineItems: TimelineItem[] = [];

        // Process trips
        for (const trip of trips) {
          const now = new Date();
          const endDate = new Date(trip.end_date);
          const isPast = endDate < now;

          timelineItems.push({
            type: 'trip',
            id: trip.id,
            name: trip.name,
            location: `${trip.city}, ${trip.country}`,
            city: trip.city || '',
            country: trip.country || '',
            startDate: trip.start_date,
            endDate: trip.end_date,
            isCurrent: false,
            isPast,
            placeCounts: {
              visited: 0,
              endorsed: 0,
              toVisit: 0,
            },
            completionPercentage: 0,
          });
        }

        // Process homes
        for (const home of homes) {
          const isCurrent = home.status === 'current';

          timelineItems.push({
            type: 'home',
            id: home.id,
            name: `${home.city}, ${home.country}`,
            location: `${home.city}, ${home.country}`,
            city: home.city,
            country: home.country,
            startDate: home.start_date,
            endDate: home.end_date || undefined,
            isCurrent,
            isPast: home.status === 'past',
            placeCounts: {
              localFavorites: 0,
            },
            completionPercentage: 0,
          });
        }

        // Sort by start date (most recent first)
        timelineItems.sort((a, b) => {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          return dateB.getTime() - dateA.getTime();
        });

        return timelineItems;
      } catch (error) {
        console.error('[useTimeline] Exception fetching timeline:', error);
        if (USE_MOCK_DATA) {
          console.warn('[useTimeline] Falling back to mock data');
          return mockTimelineItems;
        }
        throw error;
      }
    },
    enabled: !!user,
  });
}

// Organization hooks
export function useOrganizePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      placeId,
      type,
      contextId,
      status
    }: {
      placeId: string;
      type: 'trip' | 'home';
      contextId: string;
      status?: string;
    }) => {
      const response = await fetch(`${API_BASE}/places/${placeId}/organize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, contextId, status }),
      });
      if (!response.ok) throw new Error('Failed to organize place');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'places'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'lists'] });
    },
  });
}

// Photo hooks
export function useAddPhotoToTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, photo }: { tripId: string; photo: { url: string; caption?: string; displayOrder?: number } }) => {
      const response = await fetch(`${API_BASE}/trips/${tripId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photo),
      });
      if (!response.ok) throw new Error('Failed to add photo');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'trips'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'trips', variables.tripId] });
    },
  });
}

export function useAddPhotoToHome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ homeId, photo }: { homeId: string; photo: { url: string; caption?: string; displayOrder?: number } }) => {
      const response = await fetch(`${API_BASE}/homes/${homeId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photo),
      });
      if (!response.ok) throw new Error('Failed to add photo');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes', variables.homeId] });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photoId: string) => {
      const response = await fetch(`${API_BASE}/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete photo');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'trips'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes'] });
    },
  });
}

// Itinerary hooks
export function useAddItineraryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ homeId, item }: { homeId: string; item: { timeSlot: string; activityDescription: string; placeId?: string; displayOrder?: number } }) => {
      const response = await fetch(`${API_BASE}/homes/${homeId}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to add itinerary item');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes', variables.homeId] });
    },
  });
}

export function useUpdateItineraryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: { timeSlot?: string; activityDescription?: string; placeId?: string; displayOrder?: number } }) => {
      const response = await fetch(`${API_BASE}/itinerary/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update itinerary item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes'] });
    },
  });
}

export function useDeleteItineraryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`${API_BASE}/itinerary/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete itinerary item');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes'] });
    },
  });
}

// City context hook
export function useCityContext(cityName: string) {
  const { user } = useAuth();

  return useQuery<{ trips: Trip[]; homes: Home[] }>({
    queryKey: ['cities', cityName, 'context', user?.id],
    queryFn: async () => {
      if (!user || !cityName) return { trips: [], homes: [] };

      // Get trips for this city
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .eq('created_by', user.id)
        .eq('city', cityName);

      // Get homes for this city
      const { data: homesData } = await supabase
        .from('homes')
        .select('*')
        .eq('user_id', user.id)
        .eq('city', cityName);

      const trips = tripsData?.map(trip => {
        const now = new Date();
        const endDate = new Date(trip.end_date);
        const isPast = endDate < now;

        return {
          id: trip.id,
          name: trip.name,
          city: trip.city || '',
          country: trip.country || '',
          flag: '',
          imageUrl: trip.image || '',
          startDate: new Date(trip.start_date),
          endDate: endDate,
          collaborators: [],
          isPast,
          tips: trip.tips,
        } as Trip;
      }) || [];

      const homes = homesData?.map(home => ({
        id: home.id,
        city: home.city,
        country: home.country,
        startDate: home.start_date,
        endDate: home.end_date || undefined,
        status: home.status as 'current' | 'past',
        userId: home.user_id,
      })) || [];

      return { trips, homes };
    },
    enabled: !!cityName && !!user,
  });
}

// Place Review hooks (status-based system: visited, wishlist, endorsed)
export interface PlaceReviewInput {
  placeId: string;
  status: 'visited' | 'wishlist' | 'endorsed';
  review?: string;
}

export interface PlaceReview {
  id: string;
  place_id: string;
  user_id: string;
  status: 'visited' | 'wishlist' | 'endorsed' | null;
  review?: string | null;
  created_at: string;
  updated_at: string;
}

export function usePlaceReviews(placeId: string) {
  return useQuery<PlaceReview[]>({
    queryKey: ['places', placeId, 'reviews'],
    queryFn: async () => {
      if (!placeId) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('place_id', placeId);

      if (error) {
        console.error('Error fetching place reviews:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!placeId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData: PlaceReviewInput) => {
      const response = await fetch(`${API_BASE}/places/${reviewData.placeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewData.status,
          review: reviewData.review
        }),
      });
      if (!response.ok) throw new Error('Failed to create review');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'places', variables.placeId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'places'] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, placeId, ...updates }: Partial<PlaceReviewInput> & { reviewId: string; placeId: string }) => {
      const response = await fetch(`${API_BASE}/places/${placeId}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update review');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'places', variables.placeId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'places'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, placeId }: { reviewId: string; placeId: string }) => {
      const response = await fetch(`${API_BASE}/places/${placeId}/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete review');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'places', variables.placeId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'places'] });
    },
  });
}

// Place details with friend activity
export interface PlaceDetails {
  place: any;
  friendActivity?: Array<{
    friend_id: string;
    friend_name: string;
    friend_avatar_url?: string | null;
    status?: 'visited' | 'wishlist' | 'endorsed' | null;
    review?: string | null;
    created_at?: string;
  }>;
  userReview?: PlaceReview;
  recommendationCount?: number;
}

export function usePlaceDetails(placeId: string) {
  const { user } = useAuth();

  return useQuery<PlaceDetails>({
    queryKey: ['places', placeId, 'details', user?.id],
    queryFn: async () => {
      if (!placeId) return {} as PlaceDetails;

      // Get place
      const { data: place, error: placeError } = await supabase
        .from('places')
        .select('*')
        .eq('id', placeId)
        .single();

      if (placeError || !place) {
        console.error('Error fetching place:', placeError);
        return {} as PlaceDetails;
      }

      // Get friend activity if user is logged in
      let friendActivity: any[] = [];
      let userReview: any = undefined;

      if (user) {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('*, profiles(id, full_name, avatar_url)')
          .eq('place_id', placeId);

        if (reviews) {
          // Separate user's review from friend reviews
          friendActivity = reviews
            .filter(r => r.user_id !== user.id)
            .map((r: any) => ({
              friend_id: r.user_id,
              friend_name: r.profiles?.full_name || 'Unknown',
              friend_avatar_url: r.profiles?.avatar_url,
              status: r.status,
              review: r.review,
              created_at: r.created_at,
            }));

          userReview = reviews.find(r => r.user_id === user.id);
        }
      }

      return {
        place,
        friendActivity,
        userReview,
        recommendationCount: friendActivity.filter(f => f.status === 'endorsed').length,
      };
    },
    enabled: !!placeId,
  });
}

// Unorganize place hook
export function useUnorganizePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      placeId,
      type,
      contextId,
    }: {
      placeId: string;
      type: 'trip' | 'home';
      contextId: string;
    }) => {
      const response = await fetch(`${API_BASE}/places/${placeId}/organize`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, contextId }),
      });
      if (!response.ok) throw new Error('Failed to unorganize place');
      // DELETE returns 204 No Content, no JSON to parse
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'places'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'lists'] });
    },
  });
}

// Home favorites hook
export function useSetHomeFavorites() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ homeId, placeIds }: { homeId: string; placeIds: string[] }) => {
      const response = await fetch(`${API_BASE}/homes/${homeId}/favorites`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeIds }),
      });
      if (!response.ok) throw new Error('Failed to set favorites');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes'] });
      queryClient.invalidateQueries({ queryKey: [API_BASE, 'homes', variables.homeId] });
    },
  });
}
