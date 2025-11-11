/**
 * Marker System Hooks
 *
 * TanStack Query hooks for the 4-marker system (loved, liked, hasbeen, wanttogo)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { MarkerType, UserPlaceMarker } from '@/types/shared';

/**
 * Get the current user's marker for a specific place
 */
export function usePlaceMarker(placeId: string) {
  const { user } = useAuth();

  return useQuery<UserPlaceMarker | null>({
    queryKey: ['markers', 'place', placeId, user?.id],
    queryFn: async () => {
      if (!user || !placeId) return null;

      const { data, error } = await supabase
        .from('user_place_markers')
        .select('*')
        .eq('user_id', user.id)
        .eq('place_id', placeId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching place marker:', error);
        return null;
      }

      return data as UserPlaceMarker | null;
    },
    enabled: !!user && !!placeId,
  });
}

/**
 * Get all markers for a specific place (from all users)
 */
export function usePlaceMarkers(placeId: string) {
  return useQuery<UserPlaceMarker[]>({
    queryKey: ['markers', 'place', placeId, 'all'],
    queryFn: async () => {
      if (!placeId) return [];

      const { data, error } = await supabase
        .from('user_place_markers')
        .select(`
          *,
          user:user_id(id, full_name, avatar_url)
        `)
        .eq('place_id', placeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching place markers:', error);
        return [];
      }

      return (data || []) as UserPlaceMarker[];
    },
    enabled: !!placeId,
  });
}

/**
 * Get all places with a specific marker type for the current user
 */
export function useMarkerPlaces(markerType: MarkerType) {
  const { user } = useAuth();

  return useQuery<UserPlaceMarker[]>({
    queryKey: ['markers', 'user', user?.id, markerType],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_place_markers')
        .select(`
          *,
          place:place_id(id, display_name, category, city, country)
        `)
        .eq('user_id', user.id)
        .eq('marker_type', markerType)
        .order('created_at', { ascending: false});

      if (error) {
        console.error('Error fetching marker places:', error);
        return [];
      }

      return (data || []) as UserPlaceMarker[];
    },
    enabled: !!user,
  });
}

/**
 * Set or update a marker for a place
 * If marker already exists, updates it. If not, creates it.
 */
export function useSetMarker() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ placeId, markerType }: { placeId: string; markerType: MarkerType }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if marker already exists
      const { data: existing } = await supabase
        .from('user_place_markers')
        .select('id')
        .eq('user_id', user.id)
        .eq('place_id', placeId)
        .maybeSingle();

      if (existing) {
        // Update existing marker
        const { error } = await supabase
          .from('user_place_markers')
          .update({ marker_type: markerType, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;
        return { id: existing.id, action: 'updated' };
      } else {
        // Create new marker
        const { data, error } = await supabase
          .from('user_place_markers')
          .insert({
            user_id: user.id,
            place_id: placeId,
            marker_type: markerType,
          })
          .select()
          .single();

        if (error) throw error;
        return { id: data.id, action: 'created' };
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['markers', 'place', variables.placeId] });
      queryClient.invalidateQueries({ queryKey: ['markers', 'user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

/**
 * Remove a marker from a place
 */
export function useRemoveMarker() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (placeId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_place_markers')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);

      if (error) throw error;
    },
    onSuccess: (_, placeId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['markers', 'place', placeId] });
      queryClient.invalidateQueries({ queryKey: ['markers', 'user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

/**
 * Toggle "wanttogo" marker (for wishlist functionality)
 * If place is already marked as wanttogo, removes it.
 * If place has another marker, updates to wanttogo.
 * If place has no marker, adds wanttogo.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (placeId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Check current marker
      const { data: existing } = await supabase
        .from('user_place_markers')
        .select('*')
        .eq('user_id', user.id)
        .eq('place_id', placeId)
        .maybeSingle();

      if (existing?.marker_type === 'wanttogo') {
        // Remove wanttogo marker
        const { error } = await supabase
          .from('user_place_markers')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return { action: 'removed', wasWishlist: true };
      } else if (existing) {
        // Update to wanttogo
        const { error } = await supabase
          .from('user_place_markers')
          .update({ marker_type: 'wanttogo', updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;
        return { action: 'updated', wasWishlist: false };
      } else {
        // Create wanttogo marker
        const { error } = await supabase
          .from('user_place_markers')
          .insert({
            user_id: user.id,
            place_id: placeId,
            marker_type: 'wanttogo',
          });

        if (error) throw error;
        return { action: 'created', wasWishlist: false };
      }
    },
    onSuccess: (_, placeId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['markers', 'place', placeId] });
      queryClient.invalidateQueries({ queryKey: ['markers', 'user', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}
