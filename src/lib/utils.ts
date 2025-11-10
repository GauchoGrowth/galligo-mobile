/**
 * Utility functions for React Native
 * Replaces web utilities like cn() with RN-compatible alternatives
 */

import { ViewStyle, TextStyle, ImageStyle, StyleSheet } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;

/**
 * Combine multiple styles (similar to clsx/cn for web)
 * Handles arrays, objects, and conditional styles
 *
 * Usage:
 * const styles = combineStyles(
 *   baseStyle,
 *   condition && conditionalStyle,
 *   [arrayStyle1, arrayStyle2]
 * );
 */
export function combineStyles(...styles: (Style | Style[] | false | undefined | null)[]): Style {
  const result: Style = {};

  styles.forEach(style => {
    if (!style) return;

    if (Array.isArray(style)) {
      Object.assign(result, combineStyles(...style));
    } else {
      Object.assign(result, style);
    }
  });

  return result;
}

/**
 * Create responsive value based on viewport width
 * Similar to Tailwind's responsive modifiers
 */
export function responsive<T>(options: {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}, width: number): T {
  if (width >= 1024 && options.xl) return options.xl;
  if (width >= 768 && options.lg) return options.lg;
  if (width >= 430 && options.md) return options.md;
  if (width >= 375 && options.sm) return options.sm;
  return options.base;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return require('react-native').Platform.OS === 'ios';
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return require('react-native').Platform.OS === 'android';
}

/**
 * Get platform-specific value
 */
export function platformSelect<T>(options: { ios: T; android: T }): T {
  return require('react-native').Platform.select(options);
}

/**
 * Debounce function (useful for search, scroll handlers)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function (useful for scroll handlers)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) return d.toLocaleDateString();
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Sleep/delay function for animations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
