/**
 * Marker Configuration - React Native
 * Port from web app with iOS design system colors
 */

import { Ionicons } from '@expo/vector-icons';

export type MarkerType = 'loved' | 'liked' | 'hasbeen' | 'wanttogo';

interface MarkerConfig {
  id: MarkerType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: boolean;
  color: string;
  description: string;
}

export const MARKER_CONFIG: Record<MarkerType, MarkerConfig> = {
  loved: {
    id: 'loved',
    label: 'Loved this',
    icon: 'heart',
    iconFilled: true,
    color: '#23D8C2', // Lagoon Green
    description: 'Strong positive experience',
  },
  liked: {
    id: 'liked',
    label: 'Liked this',
    icon: 'checkmark-circle',
    iconFilled: false,
    color: '#0D52CE', // Ocean Blue
    description: 'Positive experience',
  },
  hasbeen: {
    id: 'hasbeen',
    label: 'Has been',
    icon: 'location',
    iconFilled: false,
    color: '#9E9E9E', // Neutral 500
    description: 'Neutral acknowledgment',
  },
  wanttogo: {
    id: 'wanttogo',
    label: 'Want to go',
    icon: 'flag',
    iconFilled: false,
    color: '#93229E', // Twilight Purple
    description: 'Aspirational/wishlist',
  },
};

export const MARKER_DISPLAY_ORDER: MarkerType[] = ['loved', 'liked', 'hasbeen'];

export function getMarkerConfig(markerType: MarkerType): MarkerConfig {
  return MARKER_CONFIG[markerType];
}
