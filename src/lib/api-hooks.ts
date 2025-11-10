import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Place, CuratedList, Trip, Home, TimelineItem } from '@/types/shared';

// Use environment variable or fallback to localhost
// In production, this would be your deployed backend URL
const API_BASE = process.env.EXPO_PUBLIC_API_URL
  ? `${process.env.EXPO_PUBLIC_API_URL}/api`
  : 'http://localhost:8080/api';

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

// Places hooks
export function usePlaces() {
  return useQuery<Place[]>({
    queryKey: [API_BASE, 'places'],
  });
}

export function useLists() {
  return useQuery<CuratedList[]>({
    queryKey: [API_BASE, 'lists'],
  });
}

export function useTrips() {
  return useQuery<Trip[]>({
    queryKey: [API_BASE, 'trips'],
    select: (data: any[]) => {
      // Convert date strings to Date objects
      return data.map(trip => ({
        ...trip,
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
      }));
    },
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
  return useQuery<UserProfile>({
    queryKey: [API_BASE, 'auth', 'me'],
    select: (data: any) => data.user, // Extract user from { user: {...} } response
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
  return useQuery<FriendsNetwork>({
    queryKey: [API_BASE, 'friends', 'network'],
  });
}

// Homes hooks
export function useHomes() {
  return useQuery<Home[]>({
    queryKey: [API_BASE, 'homes'],
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
  return useQuery<TimelineItem[]>({
    queryKey: [API_BASE, 'timeline'],
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
  return useQuery<{ trips: Trip[]; homes: Home[] }>({
    queryKey: [API_BASE, 'cities', cityName, 'context'],
    enabled: !!cityName,
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
    queryKey: [API_BASE, 'places', placeId, 'reviews'],
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
  return useQuery<PlaceDetails>({
    queryKey: [API_BASE, 'places', placeId, 'details'],
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
