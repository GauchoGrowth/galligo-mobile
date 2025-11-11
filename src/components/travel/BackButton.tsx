/**
 * BackButton Component
 *
 * iOS-style back button with:
 * - < icon + label
 * - Absolute positioned (top-left with safe area insets)
 * - Animated entrance (fade + slide from left)
 * - Haptic feedback on press
 * - Gesture support: swipe from left edge to go back
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BodySmall } from '@/components/ui';
import { theme } from '@/theme';
import {
  ANIMATION_DURATIONS,
  SPRING_CONFIGS,
  EASINGS,
  OPACITY,
  SCALE,
  GESTURE_THRESHOLDS,
  Z_INDEX,
} from '@/lib/animations/constants';

const { colors, spacing } = theme;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BackButtonProps {
  /**
   * Callback when back is pressed
   */
  onPress: () => void;

  /**
   * Label text (default: "Back")
   */
  label?: string;

  /**
   * Animate entrance (default: true)
   */
  animateEntrance?: boolean;
}

export function BackButton({ onPress, label = 'Back', animateEntrance = true }: BackButtonProps) {
  const insets = useSafeAreaInsets();

  // Animation shared values
  const opacity = useSharedValue<number>(animateEntrance ? OPACITY.HIDDEN : OPACITY.VISIBLE);
  const translateX = useSharedValue<number>(animateEntrance ? -20 : 0);
  const scale = useSharedValue<number>(animateEntrance ? 0.8 : SCALE.NORMAL);
  const pressScale = useSharedValue<number>(SCALE.NORMAL);

  // Entrance animation
  useEffect(() => {
    if (!animateEntrance) return;

    // Fade in and slide from left
    opacity.value = withDelay(
      100, // Small delay after hero entrance
      withTiming(OPACITY.VISIBLE, {
        duration: ANIMATION_DURATIONS.HERO_ENTRANCE,
        easing: EASINGS.EASE_OUT_EXPO,
      })
    );

    translateX.value = withDelay(
      100,
      withTiming(0, {
        duration: ANIMATION_DURATIONS.HERO_ENTRANCE,
        easing: EASINGS.EASE_OUT_EXPO,
      })
    );

    scale.value = withDelay(100, withSpring(SCALE.NORMAL, SPRING_CONFIGS.SMOOTH));
  }, [animateEntrance]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }, { scale: scale.value * pressScale.value }],
    };
  });

  // Handle press with haptic feedback
  const handlePress = () => {
    // Haptic feedback (iOS only)
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Press animation: scale down then bounce back
    pressScale.value = withTiming(0.9, {
      duration: ANIMATION_DURATIONS.BUTTON_PRESS / 2,
      easing: EASINGS.EASE_OUT_CUBIC,
    });

    // Bounce back
    setTimeout(() => {
      pressScale.value = withSpring(SCALE.NORMAL, SPRING_CONFIGS.SNAPPY);
    }, ANIMATION_DURATIONS.BUTTON_PRESS / 2);

    onPress();
  };

  // Swipe back gesture (iOS-style edge swipe)
  const panGesture = Gesture.Pan()
    .activeOffsetX([GESTURE_THRESHOLDS.EDGE_DETECTION_WIDTH, Infinity]) // Only trigger from left edge
    .onUpdate((event) => {
      // Visual feedback: scale based on swipe distance
      const progress = Math.min(event.translationX / GESTURE_THRESHOLDS.SWIPE_BACK_DISTANCE, 1);
      pressScale.value = 1 + progress * 0.1; // Subtle scale up
    })
    .onEnd((event) => {
      // Reset scale
      pressScale.value = withSpring(SCALE.NORMAL, SPRING_CONFIGS.SNAPPY);

      // Check if swipe met threshold
      const velocity = event.velocityX;
      const distance = event.translationX;

      if (
        velocity > GESTURE_THRESHOLDS.SWIPE_BACK_VELOCITY ||
        distance > GESTURE_THRESHOLDS.SWIPE_BACK_DISTANCE
      ) {
        // Trigger back navigation
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedPressable
        onPress={handlePress}
        style={[
          styles.container,
          {
            top: insets.top + 8,
          },
          animatedStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Go ${label.toLowerCase()}`}
        accessibilityHint="Double tap to navigate back"
      >
        <Ionicons name="chevron-back" size={20} color={colors.primary.blue} />
        <BodySmall weight="semibold" color={colors.primary.blue} style={styles.label}>
          {label}
        </BodySmall>
      </AnimatedPressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.pagePaddingMobile,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: 20,
    zIndex: Z_INDEX.BACK_BUTTON,
    // iOS-style shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    // Android shadow (elevation)
    elevation: 4,
  },
  label: {
    marginTop: 1, // Optical alignment
  },
});
