/**
 * Reusable Transition Functions
 *
 * Pre-built animation transitions using Reanimated v4
 * for common UI patterns in the Travel Log feature.
 */

import { withTiming, withSpring, withDelay, withSequence, Easing, runOnJS } from 'react-native-reanimated';
import type { WithTimingConfig, WithSpringConfig } from 'react-native-reanimated';
import { ANIMATION_DURATIONS, SPRING_CONFIGS, EASINGS } from './constants';

// ============================================================================
// Entrance Animations
// ============================================================================

/**
 * Fade in from opacity 0 to 1
 *
 * @param duration - Animation duration (ms)
 * @param delay - Optional delay before animation starts
 * @param easing - Easing curve
 * @returns Reanimated animation value
 */
export function fadeIn(
  duration: number = ANIMATION_DURATIONS.CITY_CARD_REVEAL,
  delay: number = 0,
  easing = EASINGS.EASE_OUT_EXPO
) {
  'worklet';
  const animation = withTiming(1, { duration, easing });
  return delay > 0 ? withDelay(delay, animation) : animation;
}

/**
 * Fade out from opacity 1 to 0
 *
 * @param duration - Animation duration (ms)
 * @param delay - Optional delay before animation starts
 * @param easing - Easing curve
 * @returns Reanimated animation value
 */
export function fadeOut(
  duration: number = ANIMATION_DURATIONS.FLAGS_EXIT,
  delay: number = 0,
  easing = EASINGS.EASE_IN_CUBIC
) {
  'worklet';
  const animation = withTiming(0, { duration, easing });
  return delay > 0 ? withDelay(delay, animation) : animation;
}

/**
 * Slide in from bottom
 *
 * @param fromY - Starting Y position (positive = below screen)
 * @param duration - Animation duration (ms)
 * @param delay - Optional delay
 * @param easing - Easing curve
 * @returns Reanimated animation value
 */
export function slideInFromBottom(
  fromY: number,
  duration: number = ANIMATION_DURATIONS.HERO_ENTRANCE,
  delay: number = 0,
  easing = EASINGS.EASE_OUT_EXPO
) {
  'worklet';
  const animation = withTiming(0, { duration, easing });
  return delay > 0 ? withDelay(delay, animation) : animation;
}

/**
 * Slide out to bottom
 *
 * @param toY - Ending Y position (positive = below screen)
 * @param duration - Animation duration (ms)
 * @param delay - Optional delay
 * @param easing - Easing curve
 * @returns Reanimated animation value
 */
export function slideOutToBottom(
  toY: number,
  duration: number = ANIMATION_DURATIONS.RETURN_TO_WORLD,
  delay: number = 0,
  easing = EASINGS.EASE_IN_CUBIC
) {
  'worklet';
  const animation = withTiming(toY, { duration, easing });
  return delay > 0 ? withDelay(delay, animation) : animation;
}

/**
 * Drop in from above (flag entrance animation)
 *
 * @param delay - Stagger delay for this item
 * @param duration - Animation duration (ms)
 * @returns Reanimated animation value (translateY)
 */
export function dropIn(
  delay: number = 0,
  duration: number = ANIMATION_DURATIONS.FLAG_DROP
) {
  'worklet';
  return withDelay(
    delay,
    withTiming(0, {
      duration,
      easing: EASINGS.EASE_OUT_EXPO,
    })
  );
}

/**
 * Scale in with overshoot (bouncy entrance)
 *
 * @param delay - Optional delay
 * @param config - Spring configuration
 * @returns Reanimated animation value (scale)
 */
export function scaleInBouncy(
  delay: number = 0,
  config: WithSpringConfig = SPRING_CONFIGS.BOUNCY
) {
  'worklet';
  const animation = withSpring(1, config);
  return delay > 0 ? withDelay(delay, animation) : animation;
}

/**
 * Scale out (shrink and fade)
 *
 * @param toScale - Final scale value
 * @param duration - Animation duration (ms)
 * @param delay - Optional delay
 * @returns Reanimated animation value (scale)
 */
export function scaleOut(
  toScale: number = 0.6,
  duration: number = ANIMATION_DURATIONS.FLAGS_EXIT,
  delay: number = 0
) {
  'worklet';
  const animation = withTiming(toScale, {
    duration,
    easing: EASINGS.EASE_IN_CUBIC,
  });
  return delay > 0 ? withDelay(delay, animation) : animation;
}

// ============================================================================
// Compound Animations (Multiple Properties)
// ============================================================================

/**
 * Create entrance animation (fade + scale + slide up)
 *
 * @param index - Item index for stagger
 * @param staggerDelay - Delay between items (ms)
 * @returns Object with opacity, scale, translateY animation values
 */
export function createEntranceAnimation(
  index: number,
  staggerDelay: number = ANIMATION_DURATIONS.CITY_CARD_STAGGER
) {
  'worklet';
  const delay = index * staggerDelay;

  return {
    opacity: fadeIn(ANIMATION_DURATIONS.CITY_CARD_REVEAL, delay),
    scale: scaleInBouncy(delay, SPRING_CONFIGS.SMOOTH),
    translateY: withDelay(
      delay,
      withTiming(0, {
        duration: ANIMATION_DURATIONS.CITY_CARD_REVEAL,
        easing: EASINGS.EASE_OUT_EXPO,
      })
    ),
  };
}

/**
 * Create exit animation (fade + scale + slide down)
 *
 * @param delay - Optional delay before exit
 * @returns Object with opacity, scale, translateY animation values
 */
export function createExitAnimation(delay: number = 0) {
  'worklet';
  return {
    opacity: fadeOut(ANIMATION_DURATIONS.FLAGS_EXIT, delay),
    scale: scaleOut(0.6, ANIMATION_DURATIONS.FLAGS_EXIT, delay),
    translateY: withDelay(
      delay,
      withTiming(-10, {
        duration: ANIMATION_DURATIONS.FLAGS_EXIT,
        easing: EASINGS.EASE_IN_CUBIC,
      })
    ),
  };
}

// ============================================================================
// Spring Transitions
// ============================================================================

/**
 * Smooth spring transition (for map zoom)
 *
 * @param toValue - Target value
 * @param config - Spring configuration
 * @returns Reanimated spring animation
 */
export function smoothSpring(
  toValue: number,
  config: WithSpringConfig = SPRING_CONFIGS.SMOOTH
) {
  'worklet';
  return withSpring(toValue, config);
}

/**
 * Snappy spring transition (for quick interactions)
 *
 * @param toValue - Target value
 * @param config - Spring configuration
 * @returns Reanimated spring animation
 */
export function snappySpring(
  toValue: number,
  config: WithSpringConfig = SPRING_CONFIGS.SNAPPY
) {
  'worklet';
  return withSpring(toValue, config);
}

/**
 * Bouncy spring transition (for playful elements)
 *
 * @param toValue - Target value
 * @param config - Spring configuration
 * @returns Reanimated spring animation
 */
export function bouncySpring(
  toValue: number,
  config: WithSpringConfig = SPRING_CONFIGS.BOUNCY
) {
  'worklet';
  return withSpring(toValue, config);
}

// ============================================================================
// Map Zoom Transitions
// ============================================================================

/**
 * Zoom to country transition (map transformation)
 *
 * @param targetScale - Target zoom scale (e.g., 2.5)
 * @param targetX - Target X translation
 * @param targetY - Target Y translation
 * @returns Object with scale, translateX, translateY animations
 */
export function zoomToCountry(
  targetScale: number,
  targetX: number,
  targetY: number
) {
  'worklet';
  const config = SPRING_CONFIGS.SMOOTH;

  return {
    scale: withSpring(targetScale, config),
    translateX: withSpring(targetX, config),
    translateY: withSpring(targetY, config),
  };
}

/**
 * Reset to world view transition (map transformation)
 *
 * @returns Object with scale, translateX, translateY animations
 */
export function resetToWorldView() {
  'worklet';
  const config = SPRING_CONFIGS.SMOOTH;

  return {
    scale: withSpring(1, config),
    translateX: withSpring(0, config),
    translateY: withSpring(0, config),
  };
}

// ============================================================================
// Number Transitions (for counters)
// ============================================================================

/**
 * Animate number value (for stat counters)
 *
 * @param fromValue - Starting value
 * @param toValue - Ending value
 * @param duration - Animation duration (ms)
 * @param onFrame - Optional callback on each frame (for intermediate values)
 * @returns Reanimated animation value
 */
export function animateNumber(
  toValue: number,
  duration: number = ANIMATION_DURATIONS.STATS_COUNT_UP,
  onFrame?: (value: number) => void
) {
  'worklet';
  return withTiming(toValue, {
    duration,
    easing: EASINGS.EASE_OUT_EXPO,
  }, (finished) => {
    if (finished && onFrame) {
      runOnJS(onFrame)(toValue);
    }
  });
}

// ============================================================================
// Sequential Transitions
// ============================================================================

/**
 * Pulse animation (scale up, then down)
 *
 * @param fromScale - Starting scale
 * @param toScale - Peak scale
 * @param duration - Duration for each phase
 * @returns Reanimated sequence animation
 */
export function pulse(
  fromScale: number = 1,
  toScale: number = 1.1,
  duration: number = ANIMATION_DURATIONS.FLAG_PRESS
) {
  'worklet';
  return withSequence(
    withTiming(toScale, { duration: duration / 2, easing: EASINGS.EASE_OUT_CUBIC }),
    withTiming(fromScale, { duration: duration / 2, easing: EASINGS.EASE_IN_CUBIC })
  );
}

/**
 * Bounce animation (down, up, settle)
 *
 * @param downScale - Scale during "press"
 * @param duration - Total duration
 * @returns Reanimated sequence animation
 */
export function bounce(
  downScale: number = 0.95,
  duration: number = ANIMATION_DURATIONS.BUTTON_PRESS
) {
  'worklet';
  return withSequence(
    withTiming(downScale, { duration: duration / 3, easing: EASINGS.EASE_OUT_CUBIC }),
    withSpring(1, SPRING_CONFIGS.SNAPPY)
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Cancel all running animations on a shared value
 * Useful when user rapidly switches between countries
 *
 * @param sharedValue - Reanimated shared value
 */
export function cancelAnimations(sharedValue: any) {
  'worklet';
  // Note: Reanimated doesn't have a built-in cancel function
  // We work around this by immediately setting to the current value
  // which effectively "cancels" the animation
  const current = sharedValue.value;
  sharedValue.value = current;
}

/**
 * Create a delay promise (for sequencing in async functions)
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Map Marker Animations
// ============================================================================

/**
 * Animate marker drop (from above with bounce)
 *
 * @param delay - Stagger delay before animation starts
 * @returns Animation value for translateY
 */
export function dropMarker(delay: number = 0) {
  'worklet';
  return withDelay(
    delay,
    withSpring(0, SPRING_CONFIGS.BOUNCY)
  );
}

/**
 * Animate flag to header position
 *
 * @param targetX - Target X position
 * @param targetY - Target Y position
 * @param targetScale - Target scale (e.g., 1.5 for larger in header)
 * @returns Object with translateX, translateY, scale animations
 */
export function animateFlagToHeader(
  targetX: number,
  targetY: number,
  targetScale: number = 1.5
) {
  'worklet';
  const duration = 400;
  const easing = EASINGS.EASE_IN_OUT_QUAD;

  return {
    translateX: withTiming(targetX, { duration, easing }),
    translateY: withTiming(targetY, { duration, easing }),
    scale: withSpring(targetScale, SPRING_CONFIGS.SMOOTH),
  };
}
