/**
 * GalliGo Design Tokens for React Native
 * Translated from web CSS variables to React Native compatible values
 *
 * Based on: design-system.md v1.0.0
 */

export const colors = {
  // Primary Palette
  primary: {
    black: '#131619',
    white: '#F2F2F2',
    blue: '#00DDFF',
    blueHover: '#00C4E6',
    bluePressed: '#00ABCC',
    blueLight: 'rgba(0, 221, 255, 0.1)',
    blueLighter: 'rgba(0, 221, 255, 0.05)',
  },

  // Secondary Palette
  secondary: {
    yellow: '#F5D019',
    green: '#23D8C2',
    ocean: '#0D52CE',
    purple: '#93229E',
  },

  // Neutral Scale
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic Colors
  success: '#23D8C2',
  successLight: 'rgba(35, 216, 194, 0.1)',
  successBorder: '#1DB09A',

  warning: '#F5D019',
  warningLight: 'rgba(245, 208, 25, 0.1)',
  warningBorder: '#D4B315',

  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.1)',
  errorBorder: '#DC2626',

  info: '#00DDFF',
  infoLight: 'rgba(0, 221, 255, 0.1)',
  infoBorder: '#00C4E6',

  // Dark Mode Surfaces
  dark: {
    surface1: '#131619',
    surface2: '#1C1F24',
    surface3: '#252930',
    surface4: '#2E333A',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    textDisabled: 'rgba(255, 255, 255, 0.3)',
    border: 'rgba(255, 255, 255, 0.12)',
    divider: 'rgba(255, 255, 255, 0.08)',
  },

  // Marker System Colors
  markers: {
    loved: '#23D8C2',      // Lagoon Green
    liked: '#0D52CE',      // Ocean Blue
    hasbeen: '#757575',    // Neutral 600
    wanttogo: '#93229E',   // Twilight Purple
  },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,

  // Semantic spacing
  section: 64,
  sectionMobile: 48,
  cardPadding: 48,
  cardPaddingMobile: 32,
  listGap: 16,
  listGapSm: 8,
  pagePadding: 32,
  pagePaddingMobile: 16,
  inlineGap: 8,
  inlineGapLg: 16,
  stackSm: 8,
  stackMd: 16,
  stackLg: 24,

  // Touch targets (iOS HIG)
  touchMin: 44,
  touchPreferred: 48,
  touchGap: 8,
};

export const typography = {
  // Font families - React Native uses system fonts
  fontFamily: {
    primary: 'System',  // iOS: SF Pro, Android: Roboto
    mono: 'Menlo',
  },

  // Font weights (React Native requires specific type)
  fontWeight: {
    thin: '100' as const,
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Font sizes (scaled for RN)
  fontSize: {
    display: 72,
    h1: 40,
    h2: 32,
    h3: 24,
    h4: 20,
    h5: 18,
    h6: 16,
    bodyLg: 18,
    body: 16,
    bodySm: 14,
    caption: 12,
    label: 14,
    overline: 12,
  },

  // Line heights
  lineHeight: {
    display: 80,
    h1: 48,
    h2: 40,
    h3: 32,
    h4: 28,
    h5: 24,
    h6: 24,
    bodyLg: 28,
    body: 24,
    bodySm: 20,
    caption: 16,
    label: 20,
    overline: 16,
  },

  // Letter spacing (React Native uses numeric values)
  letterSpacing: {
    display: -0.72,    // -0.02em * 72px
    h1: -0.6,          // -0.015em * 40px
    h2: -0.32,         // -0.01em * 32px
    h3: -0.12,         // -0.005em * 24px
    h4: 0,
    h5: 0,
    h6: 0.16,          // 0.01em * 16px
    bodyLg: 0,
    body: 0,
    bodySm: 0.14,      // 0.01em * 14px
    caption: 0.24,     // 0.02em * 12px
    label: 0.14,       // 0.01em * 14px
    overline: 0.96,    // 0.08em * 12px
  },
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const shadows = {
  // iOS-style subtle shadows
  0: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Android
  },
  1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  5: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },

  // Colored shadows (brand accents)
  galliBlue: {
    shadowColor: colors.primary.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  success: {
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  error: {
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
};

// Animation timing constants
export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },

  // iOS-style easing
  easing: {
    ios: 'cubic-bezier(0.42, 0, 0.58, 1)',
  },

  // Spring configurations for Reanimated
  spring: {
    smooth: {
      damping: 30,
      stiffness: 300,
      mass: 1,
    },
    bouncy: {
      damping: 25,
      stiffness: 400,
      mass: 0.8,
    },
    gentle: {
      damping: 35,
      stiffness: 200,
      mass: 1.2,
    },
  },
};

// Complete theme object
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  animation,
} as const;

export type Theme = typeof theme;
