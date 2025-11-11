/**
 * AnimatedStatsCounter Component
 *
 * Animates number changes with smooth counting animation
 * - Counts up/down smoothly when value changes
 * - Uses Reanimated useAnimatedReaction for text updates
 * - Duration: 350ms (ANIMATION_DURATIONS.STATS_COUNT_UP)
 * - Easing: EASINGS.EASE_OUT_EXPO
 */

import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ANIMATION_DURATIONS, EASINGS } from '@/lib/animations/constants';

interface AnimatedStatsCounterProps extends TextProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatNumber?: (value: number) => string;
}

/**
 * AnimatedStatsCounter
 *
 * Smoothly animates number changes in statistics displays.
 *
 * @example
 * <AnimatedStatsCounter
 *   value={42}
 *   style={styles.statsNumber}
 *   formatNumber={(val) => val.toLocaleString()}
 * />
 */
export function AnimatedStatsCounter({
  value,
  duration = ANIMATION_DURATIONS.STATS_COUNT_UP,
  prefix = '',
  suffix = '',
  formatNumber,
  style,
  ...textProps
}: AnimatedStatsCounterProps) {
  // State for displayed text
  const [displayText, setDisplayText] = useState(
    `${prefix}${formatNumber ? formatNumber(value) : value}${suffix}`
  );

  // Shared value for animated number
  const animatedValue = useSharedValue(value);

  // Animate to new value when prop changes
  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: EASINGS.EASE_OUT_EXPO,
    });
  }, [value, duration, animatedValue]);

  // Update display text as animation progresses
  useAnimatedReaction(
    () => Math.round(animatedValue.value),
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        const formattedValue = formatNumber
          ? formatNumber(currentValue)
          : currentValue.toString();
        runOnJS(setDisplayText)(`${prefix}${formattedValue}${suffix}`);
      }
    },
    [formatNumber, prefix, suffix]
  );

  return (
    <Text {...textProps} style={style}>
      {displayText}
    </Text>
  );
}

/**
 * Simple wrapper that formats numbers with locale (e.g., 1,234)
 */
export function LocalizedStatsCounter(props: AnimatedStatsCounterProps) {
  return (
    <AnimatedStatsCounter
      {...props}
      formatNumber={(val) => val.toLocaleString()}
    />
  );
}
