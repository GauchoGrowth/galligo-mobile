import type { ThreeElements } from '@react-three/fiber';
import type { WebViewMessageEvent } from 'react-native-webview';

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '../../../assets/world-continents-grouped.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '@react-three/fiber/native' {
  export * from '@react-three/fiber';
}

declare module '@react-three/drei/native' {
  export * from '@react-three/drei';
}

declare module 'react-native-webview' {
  interface WebViewProps {
    onConsoleMessage?: (event: WebViewMessageEvent) => void;
  }
}

declare module '@shopify/react-native-skia' {
  interface CanvasTouchInfo {
    x: number;
    y: number;
    type: 'start' | 'active' | 'end' | 'cancelled';
  }

  interface CanvasProps {
    onTouch?: (info: CanvasTouchInfo) => void;
  }
}

declare module '@expo-google-fonts/outfit' {
  export const Outfit_400Regular: number;
  export const Outfit_500Medium: number;
  export const Outfit_600SemiBold: number;
  export const Outfit_700Bold: number;
}

declare module '@expo-google-fonts/roboto' {
  export const Roboto_400Regular: number;
  export const Roboto_500Medium: number;
  export const Roboto_700Bold: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
