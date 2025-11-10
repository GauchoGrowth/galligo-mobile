/**
 * GalliGo Theme - Central export for all design tokens and styles
 */

export { theme, colors, spacing, typography, borderRadius, shadows, zIndex, animation } from './tokens';
export { textStyles, createTextStyle } from './textStyles';
export type { Theme } from './tokens';

// Re-export utilities
export { combineStyles, responsive, isIOS, isAndroid, platformSelect } from '../lib/utils';
