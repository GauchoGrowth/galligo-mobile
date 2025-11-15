// Trip types for My Trips page
export interface Collaborator {
  id: string;
  name: string;
  avatarUrl: string;
  initials: string;
}

export interface Trip {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  imageUrl: string;
  heroImage?: string;
  startDate: Date;
  endDate: Date;
  collaborators: Collaborator[];
  isPast: boolean;
  tips?: string;
  photos?: Photo[];
  description?: string;
  places?: Array<{
    id?: string;
    name: string;
  }>;
}

// Recommendation types for Recs page
export interface RecommendationRequest {
  id: string;
  user_id: string; // Request creator
  requester: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  message: string;
  status: 'active' | 'resolved';
  recipient_ids?: string[]; // Target friends (empty = all friends)
  responseCount: number;
  created_at: string;
  updated_at: string;
}

export interface ReceivedRecommendation {
  id: string;
  place_id: string;
  place: {
    id: string;
    name: string;
    display_name?: string;
    category?: string;
    city?: string;
    country?: string;
  };
  recommended_by: string; // User ID
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  notes?: string;
  request_id?: string; // If responding to a request
  created_at: string;
  // Marker info (from user_place_markers join)
  currentUserMarker?: MarkerType | null;
}

export interface SentRecommendation {
  id: string;
  place_id: string;
  place: {
    id: string;
    name: string;
    display_name?: string;
    category?: string;
    city?: string;
    country?: string;
  };
  recipient_id: string;
  recipient: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  notes?: string;
  request_id?: string; // If responding to a request
  created_at: string;
  // Engagement tracking (from user_place_markers)
  recipientMarker?: MarkerType | null;
}

// Wishlist is just places with "wanttogo" marker
export interface WishlistPlace {
  id: string;
  place_id: string;
  place: {
    id: string;
    name: string;
    display_name?: string;
    category?: string;
    city?: string;
    country?: string;
  };
  recommenders: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    notes?: string;
  }>;
  marked_at: string;
}

// Input types for creating/sending
export interface CreateRequestInput {
  message: string;
  recipient_ids?: string[]; // Empty = all friends
}

export interface SendRecommendationInput {
  place_id: string;
  recipient_id: string;
  notes?: string;
  request_id?: string; // If responding to a request
}

// Trip Detail types
export type ActivityCategory = 'restaurant' | 'coffee' | 'activity' | 'hotel' | 'sightseeing' | 'shopping' | 'nightlife';
export type ActivityStatus = 'planned' | 'completed' | 'skipped';

export interface TripActivity {
  id: string;
  tripId: string;
  placeName: string;
  category: ActivityCategory;
  address?: string;
  notes?: string;
  dayNumber?: number; // Which day of the trip (1-indexed), null if unscheduled
  scheduledTime?: string; // e.g., "10:00 AM" or "Morning"
  status: ActivityStatus;
  addedBy: {
    name: string;
    avatarUrl: string;
  };
  recommenders?: Array<{
    name: string;
    avatarUrl: string;
    note?: string;
  }>;
}

export interface TripNetworkRec {
  id: string;
  placeName: string;
  category: ActivityCategory;
  address: string;
  recommenders: Array<{
    name: string;
    avatarUrl: string;
    note?: string;
  }>;
  addedToTrip: boolean;
  popularity: number; // How many friends recommended it
}

// Place organization types
export type PlaceContext = 'trip' | 'home';
export type ListColor = 'amber' | 'purple' | 'emerald' | 'blue' | 'pink' | 'teal';

export interface Place {
  id: string;
  name: string;
  city: string;
  country: string;
  category: ActivityCategory;
  note?: string;
  organized: boolean;
  context?: PlaceContext;
  tripName?: string; // Trip name if context is 'trip'
  homeYears?: string; // Years lived there if context is 'home'
  lists: string[]; // Array of list IDs this place belongs to
  imageUrl?: string;
}

export interface CuratedList {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: ListColor;
  userId?: string; // For future user association
}

export interface SmartPrompt {
  city: string;
  count: number;
  dismissed: boolean;
}

// Photo types
export interface Photo {
  id: string;
  tripId?: string;
  homeId?: string;
  url: string;
  caption?: string;
  displayOrder: number;
  createdAt?: string;
}

// Itinerary types
export interface ItineraryItem {
  id: string;
  homeId: string;
  timeSlot: string;
  activityDescription: string;
  placeId?: string;
  displayOrder: number;
  createdAt?: string;
}

// Home types
export interface Home {
  id: string;
  city: string;
  country: string;
  adminDivision?: string;
  adminDivisionCode?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate?: string; // null = current home
  status: 'current' | 'past';
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  tips?: string;
  favorites?: string[]; // Array of up to 3 place IDs
  photos?: Photo[];
  itinerary?: ItineraryItem[];
}

// Timeline types
export interface PlaceCounts {
  visited?: number;
  endorsed?: number;
  toVisit?: number;
  localFavorites?: number;
}

export interface TimelineItem {
  type: 'trip' | 'home';
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  isPast: boolean;
  placeCounts: PlaceCounts;
  completionPercentage: number;
}

// Enhanced Place types for new unified system
export type PlaceStatus = 'visited' | 'wishlist' | 'endorsed' | null;

export interface DatabasePlace {
  id: string;
  display_name: string | null;
  ai_description: string | null;
  google_place_id: string | null;
  google_maps_url: string | null;
  subtype: string | null;
  category: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  country: string | null;
  country_code: string | null;
  admin_division: string | null;
  admin_division_code: string | null;
  metro_area: string | null;
  created_at?: string;
}

export interface ResolvedPlace {
  id: string;
  name: string;
  displayName?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  subtype?: string | null;
  category?: string | null;
  ai_description?: string | null;
  google_place_id?: string | null;
  google_maps_url?: string | null;
  lat?: number | null;
  lng?: number | null;
  isLoading: boolean;
  source: 'database' | 'google' | 'fallback';
}

export interface FriendActivity {
  friend_id: string;
  friend_name: string;
  friend_avatar_url?: string | null;
  status?: PlaceStatus;
  review?: string | null;
  created_at?: string;
}

export interface PlaceReview {
  id: string;
  place_id: string;
  user_id: string;
  status: PlaceStatus;
  review?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaceWithActivity extends DatabasePlace {
  friendActivity?: FriendActivity[];
  userReview?: PlaceReview;
  recommendationCount?: number;
}

export interface PlaceRecommendationAttribution {
  friend_id: string;
  friend_name: string;
  friend_avatar_url?: string | null;
  note?: string | null;
}

// =====================================================
// Marker System Types
// =====================================================

/**
 * Marker type for the 4-marker system
 * - loved: Strong positive experience (green, heart)
 * - liked: Positive experience (blue, check)
 * - hasbeen: Neutral acknowledgment (gray, pin)
 * - wanttogo: Aspirational/wishlist (purple, target)
 */
export type MarkerType = 'loved' | 'liked' | 'hasbeen' | 'wanttogo';

/**
 * User place marker record from database
 */
export interface UserPlaceMarker {
  id: string;
  user_id: string;
  place_id: string;
  marker_type: MarkerType;
  created_at: string;
  updated_at: string;
}

/**
 * Aggregated marker statistics for a place
 * Used to display counts like "2 loved, 3 liked, 5 have been"
 */
export interface MarkerStats {
  loved: number;
  liked: number;
  hasbeen: number;
  wanttogo: number;
}

/**
 * Individual marker attribution with user details
 * Used to display "Sarah and Jake loved this"
 */
export interface MarkerAttribution {
  user_id: string;
  user_name: string;
  avatar_url?: string | null;
  marker_type: MarkerType;
  created_at?: string;
}

/**
 * Place with marker information
 * Extends DatabasePlace with marker stats and attributions
 */
export interface PlaceWithMarkers extends DatabasePlace {
  markers: MarkerAttribution[];
  markerStats: MarkerStats;
  currentUserMarker?: MarkerType | null;
}
