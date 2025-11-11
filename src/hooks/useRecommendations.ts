/**
 * Recommendation Hooks
 *
 * TanStack Query hooks for recommendation requests and sent/received recommendations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type {
  RecommendationRequest,
  ReceivedRecommendation,
  SentRecommendation,
  WishlistPlace,
  CreateRequestInput,
  SendRecommendationInput,
  MarkerType,
} from '@/types/shared';

/**
 * Fetch recommendation requests for the current user
 * Returns requests where user is either creator OR recipient
 */
export function useRecommendationRequests() {
  const { user } = useAuth();

  return useQuery<RecommendationRequest[]>({
    queryKey: ['recommendation-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all active requests where user is creator or recipient
      const { data, error } = await supabase
        .from('recommendation_requests')
        .select(`
          *,
          requester:user_id(id, full_name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recommendation requests:', error);
        throw error;
      }

      // Get response counts for each request
      const requestsWithCounts = await Promise.all(
        (data || []).map(async (request) => {
          const { count } = await supabase
            .from('place_recommendations')
            .select('*', { count: 'exact', head: true })
            .eq('request_id', request.id);

          return {
            id: request.id,
            user_id: request.user_id || '',
            requester: {
              id: (request as any).requester?.id || request.user_id || '',
              name: (request as any).requester?.full_name || 'Unknown',
              avatarUrl: (request as any).requester?.avatar_url,
            },
            message: request.message || '',
            status: (request.status || 'active') as 'active' | 'resolved',
            recipient_ids: request.recipient_ids || [],
            responseCount: count || 0,
            created_at: request.created_at,
            updated_at: request.updated_at,
          } as RecommendationRequest;
        })
      );

      return requestsWithCounts;
    },
    enabled: !!user,
  });
}

/**
 * Fetch recommendations received by the current user
 */
export function useReceivedRecommendations() {
  const { user } = useAuth();

  return useQuery<ReceivedRecommendation[]>({
    queryKey: ['recommendations', 'received', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('place_recommendations')
        .select(`
          *,
          place:place_id(id, display_name, category, city, country),
          sender:recommended_by(id, full_name, avatar_url)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching received recommendations:', error);
        throw error;
      }

      // Get marker info for each place
      const recsWithMarkers = await Promise.all(
        (data || []).map(async (rec) => {
          const { data: marker } = await supabase
            .from('user_place_markers')
            .select('marker_type')
            .eq('user_id', user.id)
            .eq('place_id', rec.place_id)
            .maybeSingle();

          const place = (rec as any).place;
          const sender = (rec as any).sender;

          return {
            id: rec.id,
            place_id: rec.place_id,
            place: {
              id: place?.id || rec.place_id,
              name: place?.display_name || 'Unknown Place',
              display_name: place?.display_name,
              category: place?.category,
              city: place?.city,
              country: place?.country,
            },
            recommended_by: rec.recommended_by,
            sender: {
              id: sender?.id || rec.recommended_by,
              name: sender?.full_name || 'Unknown',
              avatarUrl: sender?.avatar_url,
            },
            notes: typeof rec.notes === 'string' ? rec.notes : undefined,
            request_id: rec.message_id || undefined,
            created_at: rec.created_at,
            currentUserMarker: (marker?.marker_type as MarkerType) || null,
          } as ReceivedRecommendation;
        })
      );

      return recsWithMarkers;
    },
    enabled: !!user,
  });
}

/**
 * Fetch recommendations sent by the current user
 */
export function useSentRecommendations() {
  const { user } = useAuth();

  return useQuery<SentRecommendation[]>({
    queryKey: ['recommendations', 'sent', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error} = await supabase
        .from('place_recommendations')
        .select(`
          *,
          place:place_id(id, display_name, category, city, country),
          recipient:recipient_id(id, full_name, avatar_url)
        `)
        .eq('recommended_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sent recommendations:', error);
        throw error;
      }

      // Get recipient marker info for each place
      const recsWithMarkers = await Promise.all(
        (data || []).map(async (rec) => {
          let recipientMarker: MarkerType | null = null;

          if (rec.recipient_id) {
            const { data: marker } = await supabase
              .from('user_place_markers')
              .select('marker_type')
              .eq('user_id', rec.recipient_id)
              .eq('place_id', rec.place_id)
              .maybeSingle();

            recipientMarker = (marker?.marker_type as MarkerType) || null;
          }

          const place = (rec as any).place;
          const recipient = (rec as any).recipient;

          return {
            id: rec.id,
            place_id: rec.place_id,
            place: {
              id: place?.id || rec.place_id,
              name: place?.display_name || 'Unknown Place',
              display_name: place?.display_name,
              category: place?.category,
              city: place?.city,
              country: place?.country,
            },
            recipient_id: rec.recipient_id || '',
            recipient: {
              id: recipient?.id || rec.recipient_id || '',
              name: recipient?.full_name || 'Unknown',
              avatarUrl: recipient?.avatar_url,
            },
            notes: typeof rec.notes === 'string' ? rec.notes : undefined,
            request_id: rec.message_id || undefined,
            created_at: rec.created_at,
            recipientMarker,
          } as SentRecommendation;
        })
      );

      return recsWithMarkers;
    },
    enabled: !!user,
  });
}

/**
 * Fetch wishlist (places with "wanttogo" marker)
 */
export function useWishlist() {
  const { user } = useAuth();

  return useQuery<WishlistPlace[]>({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all places marked as "wanttogo"
      const { data: markers, error } = await supabase
        .from('user_place_markers')
        .select(`
          *,
          place:place_id(id, display_name, category, city, country)
        `)
        .eq('user_id', user.id)
        .eq('marker_type', 'wanttogo')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
      }

      // For each place, get all recommendations that led to it
      const wishlistWithRecs = await Promise.all(
        (markers || []).map(async (marker) => {
          const { data: recs } = await supabase
            .from('place_recommendations')
            .select(`
              *,
              sender:recommended_by(id, full_name, avatar_url)
            `)
            .eq('place_id', marker.place_id)
            .eq('recipient_id', user.id);

          const place = (marker as any).place;

          return {
            id: marker.id,
            place_id: marker.place_id,
            place: {
              id: place?.id || marker.place_id,
              name: place?.display_name || 'Unknown Place',
              display_name: place?.display_name,
              category: place?.category,
              city: place?.city,
              country: place?.country,
            },
            recommenders: (recs || []).map((rec: any) => ({
              id: rec.sender?.id || rec.recommended_by,
              name: rec.sender?.full_name || 'Unknown',
              avatarUrl: rec.sender?.avatar_url,
              notes: typeof rec.notes === 'string' ? rec.notes : undefined,
            })),
            marked_at: marker.created_at,
          } as WishlistPlace;
        })
      );

      return wishlistWithRecs;
    },
    enabled: !!user,
  });
}

/**
 * Create a new recommendation request
 */
export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateRequestInput) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recommendation_requests')
        .insert({
          user_id: user.id,
          message: input.message,
          status: 'active',
          recipient_ids: input.recipient_ids || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendation-requests'] });
      // TODO: Send push notifications to recipients
    },
  });
}

/**
 * Send a recommendation to a friend
 */
export function useSendRecommendation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: SendRecommendationInput) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('place_recommendations')
        .insert({
          place_id: input.place_id,
          recipient_id: input.recipient_id,
          recommended_by: user.id,
          notes: input.notes,
          request_id: input.request_id, // Link to request if responding
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['recommendation-requests'] });
      // TODO: Send push notification to recipient
    },
  });
}

/**
 * Mark a recommendation request as resolved
 */
export function useResolveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('recommendation_requests')
        .update({ status: 'resolved' })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendation-requests'] });
    },
  });
}
