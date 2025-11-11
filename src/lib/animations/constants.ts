/**
 * Animation Constants
 *
 * Centralized timing values, spring configurations, and easing curves
 * for consistent animations throughout the Travel Log feature.
 *
 * All durations in milliseconds.
 */

import { Easing } from 'react-native-reanimated';

// ============================================================================
// Animation Durations
// ============================================================================

export const ANIMATION_DURATIONS = {
  // World view entrance animations
  FLAG_DROP: 350,           // Each flag's drop-in duration
  FLAG_STAGGER: 50,         // Delay between each flag drop
  STATS_COUNT_UP: 350,      // Stats counter animation
  PROFILE_FADE_IN: 300,     // Profile header fade in

  // Country transition (world → country detail)
  MAP_ZOOM: 440,            // Map zoom animation (matches web)
  FLAGS_EXIT: 300,          // Unselected flags fade out
  FLAG_MOVE_TO_HEADER: 500, // Selected flag moves to header position
  HERO_ENTRANCE: 400,       // Hero section slides up
  CITY_CARD_REVEAL: 300,    // Individual city card fade-in
  CITY_CARD_STAGGER: 80,    // Delay between city cards

  // Return transition (country → world)
  RETURN_TO_WORLD: 500,     // Slightly faster than entry

  // Micro-interactions
  FLAG_PRESS: 150,          // Flag press feedback
  BUTTON_PRESS: 100,        // Button press feedback
  HAPTIC_DELAY: 0,          // Haptic feedback delay (immediate)
} as const;

// ============================================================================
// Spring Physics Configurations
// ============================================================================

export const SPRING_CONFIGS = {
  /**
   * Smooth, gentle spring - Used for map zoom
   * Feels natural without overshooting
   */
  SMOOTH: {
    damping: 20,
    stiffness: 90,
    mass: 0.8,
  },

  /**
   * Snappy spring - Used for quick interactions
   * Responsive without feeling sluggish
   */
  SNAPPY: {
    damping: 15,
    stiffness: 150,
    mass: 0.6,
  },

  /**
   * Bouncy spring - Used for playful elements
   * Adds personality with controlled overshoot
   */
  BOUNCY: {
    damping: 12,
    stiffness: 200,
    mass: 0.8,
  },

  /**
   * Flag selection spring - Matches web app behavior
   * High stiffness for immediate response
   */
  FLAG_SELECTION: {
    damping: 25,
    stiffness: 400,
    mass: 0.8,
  },

  /**
   * iOS default spring - Platform standard
   * Used for most UI transitions
   */
  IOS_DEFAULT: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
} as const;

// ============================================================================
// Easing Curves (Bézier)
// ============================================================================

export const EASINGS = {
  /**
   * iOS default easing - cubic-bezier(0.42, 0, 0.58, 1)
   * Standard for iOS platform animations
   */
  IOS_DEFAULT: Easing.bezier(0.42, 0, 0.58, 1),

  /**
   * Ease-out exponential - cubic-bezier(0.22, 1, 0.36, 1)
   * Snappy start, gentle end
   * Used for entrance animations
   */
  EASE_OUT_EXPO: Easing.bezier(0.22, 1, 0.36, 1),

  /**
   * Ease-out back - cubic-bezier(0.34, 1.56, 0.64, 1)
   * Slight overshoot for playful effect
   * Used for flag movements
   */
  EASE_OUT_BACK: Easing.bezier(0.34, 1.56, 0.64, 1),

  /**
   * Ease-in-out quad - cubic-bezier(0.25, 0.1, 0.25, 1)
   * Smooth acceleration and deceleration
   * Used for content reveals
   */
  EASE_IN_OUT_QUAD: Easing.bezier(0.25, 0.1, 0.25, 1),

  /**
   * Ease-in cubic - cubic-bezier(0.32, 0, 0.67, 0)
   * Gradual acceleration
   * Used for exit animations
   */
  EASE_IN_CUBIC: Easing.bezier(0.32, 0, 0.67, 0),

  /**
   * Ease-out cubic - cubic-bezier(0.33, 1, 0.68, 1)
   * Quick deceleration
   * Used for snap animations
   */
  EASE_OUT_CUBIC: Easing.bezier(0.33, 1, 0.68, 1),
} as const;

// ============================================================================
// Gesture Thresholds
// ============================================================================

export const GESTURE_THRESHOLDS = {
  /**
   * Swipe back velocity threshold (points/second)
   * User must swipe at least this fast to trigger back navigation
   */
  SWIPE_BACK_VELOCITY: 500,

  /**
   * Swipe back distance threshold (points)
   * User must swipe at least this far to trigger back navigation
   */
  SWIPE_BACK_DISTANCE: 100,

  /**
   * Edge detection width (points)
   * Swipe-back only works when starting within this distance from left edge
   */
  EDGE_DETECTION_WIDTH: 50,

  /**
   * Long press duration (milliseconds)
   * How long user must press before long press activates
   */
  LONG_PRESS_DURATION: 500,
} as const;

// ============================================================================
// Layout Constants
// ============================================================================

export const LAYOUT = {
  /**
   * Map header height in world view
   */
  MAP_HEADER_HEIGHT: 200,

  /**
   * Hero section height in country detail view
   */
  HERO_HEIGHT: 300,

  /**
   * Minimum parallax scroll distance
   */
  PARALLAX_SCROLL_RANGE: 200,

  /**
   * Parallax factor (0-1, where 0.5 = 50% speed)
   */
  PARALLAX_FACTOR: 0.5,

  /**
   * Flag icon sizes
   */
  FLAG_SIZE: {
    sm: 32,
    md: 40,
    lg: 48,
  },

  /**
   * Touch target minimum size (iOS HIG)
   */
  MIN_TOUCH_TARGET: 44,
} as const;

// ============================================================================
// Z-Index Layers
// ============================================================================

export const Z_INDEX = {
  MAP: 0,
  CONTENT: 1,
  FLAGS: 2,
  HERO: 3,
  BACK_BUTTON: 10,
  MODAL: 100,
} as const;

// ============================================================================
// Opacity Values
// ============================================================================

export const OPACITY = {
  HIDDEN: 0,
  FADED: 0.25,
  SEMI_TRANSPARENT: 0.5,
  MOSTLY_VISIBLE: 0.75,
  VISIBLE: 1,

  // Specific use cases
  DIMMED_MAP: 0.3,
  GRADIENT_START: 0,
  GRADIENT_END: 0.9,
} as const;

// ============================================================================
// Scale Values
// ============================================================================

export const SCALE = {
  HIDDEN: 0,
  SHRUNK: 0.6,
  SLIGHTLY_SMALLER: 0.9,
  NORMAL: 1,
  SLIGHTLY_LARGER: 1.1,
  ENLARGED: 1.25,
  VERY_LARGE: 1.5,

  // Map zoom levels
  WORLD_VIEW: 1,
  COUNTRY_VIEW: 2.5,
  CITY_VIEW: 5,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate stagger delay for index
 *
 * @param index - Item index
 * @param staggerDelay - Delay between items (default: 80ms)
 * @returns Total delay for this item
 */
export function getStaggerDelay(index: number, staggerDelay: number = ANIMATION_DURATIONS.CITY_CARD_STAGGER): number {
  return index * staggerDelay;
}

/**
 * Get spring config by name
 *
 * @param name - Spring config name
 * @returns Spring configuration object
 */
export function getSpringConfig(name: keyof typeof SPRING_CONFIGS) {
  return SPRING_CONFIGS[name];
}

/**
 * Get easing curve by name
 *
 * @param name - Easing curve name
 * @returns Easing function
 */
export function getEasing(name: keyof typeof EASINGS) {
  return EASINGS[name];
}

/**
 * Check if device should use reduced motion
 * (Can be expanded to check system accessibility settings)
 *
 * @returns Whether to reduce motion
 */
export function shouldReduceMotion(): boolean {
  // TODO: Hook into React Native AccessibilityInfo
  // For now, return false (full animations)
  return false;
}

/**
 * Get animation duration with optional reduction for reduced motion
 *
 * @param duration - Base duration
 * @param reduceMotion - Whether to reduce for accessibility
 * @returns Final duration
 */
export function getAnimationDuration(duration: number, reduceMotion: boolean = false): number {
  if (reduceMotion || shouldReduceMotion()) {
    // Reduce to 25% of original duration (or min 100ms)
    return Math.max(100, duration * 0.25);
  }
  return duration;
}
