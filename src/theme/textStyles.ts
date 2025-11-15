/**
 * Pre-defined text styles matching GalliGo design system
 * Use these instead of inline styles for consistency
 */

import { TextStyle } from 'react-native';
import { theme } from './tokens';

const { typography, colors } = theme;
const headingFonts = typography.fontFamily.heading;
const bodyFonts = typography.fontFamily.body;
const primaryText = colors.text.primary;
const secondaryText = colors.text.secondary;

export const textStyles: Record<string, TextStyle> = {
  // Display
  display: {
    fontFamily: headingFonts.bold,
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.display,
    letterSpacing: typography.letterSpacing.display,
    color: primaryText,
  },

  // Headings
  h1: {
    fontFamily: headingFonts.semibold,
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h1,
    letterSpacing: typography.letterSpacing.h1,
    color: primaryText,
  },

  h2: {
    fontFamily: headingFonts.semibold,
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h2,
    letterSpacing: typography.letterSpacing.h2,
    color: primaryText,
  },

  h3: {
    fontFamily: headingFonts.medium,
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h3,
    letterSpacing: typography.letterSpacing.h3,
    color: primaryText,
  },

  h4: {
    fontFamily: headingFonts.medium,
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h4,
    letterSpacing: typography.letterSpacing.h4,
    color: primaryText,
  },

  h5: {
    fontFamily: headingFonts.medium,
    fontSize: typography.fontSize.h5,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h5,
    letterSpacing: typography.letterSpacing.h5,
    color: primaryText,
  },

  h6: {
    fontFamily: headingFonts.regular,
    fontSize: typography.fontSize.h6,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.h6,
    letterSpacing: typography.letterSpacing.h6,
    color: primaryText,
  },

  // Body text
  bodyLarge: {
    fontFamily: bodyFonts.regular,
    fontSize: typography.fontSize.bodyLg,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.bodyLg,
    letterSpacing: typography.letterSpacing.bodyLg,
    color: primaryText,
  },

  body: {
    fontFamily: bodyFonts.regular,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.body,
    letterSpacing: typography.letterSpacing.body,
    color: primaryText,
  },

  bodySmall: {
    fontFamily: bodyFonts.regular,
    fontSize: typography.fontSize.bodySm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.bodySm,
    letterSpacing: typography.letterSpacing.bodySm,
    color: primaryText,
  },

  // Caption
  caption: {
    fontFamily: bodyFonts.regular,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.caption,
    letterSpacing: typography.letterSpacing.caption,
    color: secondaryText,
  },

  // Label
  label: {
    fontFamily: bodyFonts.medium,
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.label,
    letterSpacing: typography.letterSpacing.label,
    color: primaryText,
  },

  // Overline
  overline: {
    fontFamily: bodyFonts.medium,
    fontSize: typography.fontSize.overline,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.overline,
    letterSpacing: typography.letterSpacing.overline,
    color: secondaryText,
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
