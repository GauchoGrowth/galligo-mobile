/**
 * Text Component - GalliGo Design System
 *
 * Pre-styled text component with typography variants
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { textStyles } from '@/theme/textStyles';
import { combineStyles } from '@/theme';

// ============================================================================
// TYPES
// ============================================================================

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'overline';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Text content */
  children: React.ReactNode;

  /** Typography variant */
  variant?: TextVariant;

  /** Text color (overrides variant default) */
  color?: string;

  /** Text align */
  align?: 'left' | 'center' | 'right';

  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';

  /** Flex value (for layout) */
  flex?: number;

  /** Number of lines to show (truncate) */
  numberOfLines?: number;

  /** Custom style */
  style?: TextStyle | TextStyle[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color,
  align,
  weight,
  flex,
  numberOfLines,
  style,
  ...rest
}) => {
  // Combine styles
  const combinedStyle = combineStyles(
    textStyles[variant],
    color ? { color } : undefined,
    align ? { textAlign: align } : undefined,
    weight ? { fontWeight: FONT_WEIGHTS[weight] } : undefined,
    flex !== undefined ? { flex } : undefined,
    style
  );

  return (
    <RNText
      style={combinedStyle as TextStyle}
      numberOfLines={numberOfLines}
      {...rest}
    >
      {children}
    </RNText>
  );
};

// Convenience components for common variants
export const Display: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="display" {...props} />
);

export const H1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h1" {...props} />
);

export const H2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h2" {...props} />
);

export const H3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h3" {...props} />
);

export const Body: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body" {...props} />
);

export const BodyLarge: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="bodyLarge" {...props} />
);

export const BodySmall: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="bodySmall" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" {...props} />
);

export const Label: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="label" {...props} />
);
