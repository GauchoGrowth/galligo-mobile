/**
 * Globe State Management
 * Manages 3D globe selection, camera position, and animations
 */

import { create } from 'zustand';

interface GlobeState {
  selectedCountry: string | null;
  selectedContinent: string | null;
  cameraPosition: [number, number, number];
  cameraRotation: [number, number, number];
  isAnimating: boolean;

  selectCountry: (countryCode: string) => void;
  selectContinent: (continent: string) => void;
  resetSelection: () => void;
  setCameraPosition: (pos: [number, number, number]) => void;
  setCameraRotation: (rot: [number, number, number]) => void;
}

// Helper: Calculate camera position based on country ISO code
function calculateCountryPosition(countryCode: string): [number, number, number] {
  // Map ISO codes to approximate lat/lon, then convert to 3D position
  const countryLatLon: Record<string, [number, number]> = {
    // North America
    'us': [37.0902, -95.7129],
    'ca': [56.1304, -106.3468],
    'mx': [23.6345, -102.5528],

    // South America
    'ar': [-38.4161, -63.6167],
    'br': [-14.2350, -51.9253],
    'cl': [-35.6751, -71.5430],

    // Europe
    'fr': [46.2276, 2.2137],
    'es': [40.4637, -3.7492],
    'gb': [55.3781, -3.4360],
    'de': [51.1657, 10.4515],
    'it': [41.8719, 12.5674],

    // Asia
    'cn': [35.8617, 104.1954],
    'jp': [36.2048, 138.2529],
    'in': [20.5937, 78.9629],
    'kr': [35.9078, 127.7669],

    // Africa
    'za': [-30.5595, 22.9375],
    'eg': [26.8206, 30.8025],
    'ng': [9.0820, 8.6753],

    // Oceania
    'au': [-25.2744, 133.7751],
    'nz': [-40.9006, 174.8860],
  };

  const [lat, lon] = countryLatLon[countryCode.toLowerCase()] || [0, 0];

  // Convert lat/lon to 3D camera position (sphere with radius ~3-4 for good view)
  const radius = 3.5;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

// Helper: Calculate camera position for continent
function calculateContinentPosition(continent: string): [number, number, number] {
  const positions: Record<string, [number, number, number]> = {
    'Africa': [1, 0, 3.5],
    'Asia': [-2.5, 1, 3],
    'Europe': [1.5, 1.8, 2.5],
    'North America': [2.5, 1.5, 2.5],
    'South America': [2, -1.5, 2.5],
    'Oceania': [-2.5, -1.5, 3],
    'Antarctica': [0, -3, 2],
  };
  return positions[continent] || [0, 0, 5];
}

export const useGlobeStore = create<GlobeState>((set, get) => ({
  selectedCountry: null,
  selectedContinent: null,
  cameraPosition: [0, 0, 5],
  cameraRotation: [0, 0, 0],
  isAnimating: false,

  selectCountry: (countryCode) => {
    console.log('[GlobeStore] Selecting country:', countryCode);

    const position = calculateCountryPosition(countryCode);

    set({
      selectedCountry: countryCode,
      selectedContinent: null,
      isAnimating: true,
      cameraPosition: position,
    });

    // Animation duration: 1500ms (iOS-native standard)
    setTimeout(() => {
      set({ isAnimating: false });
    }, 1700);
  },

  selectContinent: (continent) => {
    console.log('[GlobeStore] Selecting continent:', continent);

    const position = calculateContinentPosition(continent);

    set({
      selectedContinent: continent,
      selectedCountry: null,
      isAnimating: true,
      cameraPosition: position,
    });

    setTimeout(() => {
      set({ isAnimating: false });
    }, 1700);
  },

  resetSelection: () => {
    console.log('[GlobeStore] Resetting selection');

    set({
      selectedCountry: null,
      selectedContinent: null,
      isAnimating: true,
      cameraPosition: [0, 0, 5],
      cameraRotation: [0, 0, 0],
    });

    setTimeout(() => {
      set({ isAnimating: false });
    }, 1000);
  },

  setCameraPosition: (pos) => {
    set({ cameraPosition: pos });
  },

  setCameraRotation: (rot) => {
    set({ cameraRotation: rot });
  },
}));
