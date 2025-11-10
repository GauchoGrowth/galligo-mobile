/**
 * Pre-defined text styles matching GalliGo design system
 * Use these instead of inline styles for consistency
 */

import { TextStyle } from 'react-native';
import { theme } from './tokens';

const { typography, colors } = theme;

export const textStyles: Record<string, TextStyle> = {
  // Display
  display: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.display,
    letterSpacing: typography.letterSpacing.display,
    color: colors.primary.black,
  },

  // Headings
  h1: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h1,
    letterSpacing: typography.letterSpacing.h1,
    color: colors.primary.black,
  },

  h2: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h2,
    letterSpacing: typography.letterSpacing.h2,
    color: colors.primary.black,
  },

  h3: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h3,
    letterSpacing: typography.letterSpacing.h3,
    color: colors.primary.black,
  },

  h4: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h4,
    letterSpacing: typography.letterSpacing.h4,
    color: colors.primary.black,
  },

  h5: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.h5,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h5,
    letterSpacing: typography.letterSpacing.h5,
    color: colors.primary.black,
  },

  h6: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.h6,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h6,
    letterSpacing: typography.letterSpacing.h6,
    color: colors.primary.black,
  },

  // Body text
  bodyLarge: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.bodyLg,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.bodyLg,
    letterSpacing: typography.letterSpacing.bodyLg,
    color: colors.primary.black,
  },

  body: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.body,
    letterSpacing: typography.letterSpacing.body,
    color: colors.primary.black,
  },

  bodySmall: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.bodySm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.bodySm,
    letterSpacing: typography.letterSpacing.bodySm,
    color: colors.primary.black,
  },

  // Caption
  caption: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.caption,
    letterSpacing: typography.letterSpacing.caption,
    color: colors.neutral[600],
  },

  // Label
  label: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.label,
    letterSpacing: typography.letterSpacing.label,
    color: colors.primary.black,
  },

  // Overline
  overline: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.overline,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.overline,
    letterSpacing: typography.letterSpacing.overline,
    color: colors.neutral[600],
    textTransform: 'uppercase' as const,
  },
};

/**
 * Helper to create text style variants
 * Usage: textStyles.body with color override
 */
export const createTextStyle = (
  baseStyle: keyof typeof textStyles,
  overrides?: Partial<TextStyle>
): TextStyle => ({
  ...textStyles[baseStyle],
  ...overrides,
});
