// @ts-nocheck
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { theme } from '@/theme';
// Use bundled topology to avoid network fetch failures in simulator
// eslint-disable-next-line @typescript-eslint/no-var-requires
const localTopo = require('../../../assets/geo/countries-110m.json');
// topojson-client is already in deps; lazy require to avoid metro issues on web
// eslint-disable-next-line @typescript-eslint/no-var-requires
const topojson = require('topojson-client');

const GLOBE_RADIUS = 100;

interface GeoJSONFeature {
  type: string;
  properties: {
    ADMIN: string;
    ISO_A2: string;
    ISO_A3: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any[];
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

interface CountryData {
  iso2: string;
  iso3: string;
  name: string;
  status?: 'home' | 'lived' | 'visited' | 'wishlist' | 'friends-only' | 'unseen';
}

interface PoliticalGlobeProps {
  onCountrySelect?: (country: CountryData | null) => void;
  countriesByIso3?: Record<string, CountryData>;
}

// Convert lat/lon to 3D sphere coordinates with validation
const latLonToSphere = (lat: number, lon: number, radius: number): THREE.Vector3 | null => {
  // Validate inputs
  if (
    typeof lat !== 'number' || typeof lon !== 'number' ||
    isNaN(lat) || isNaN(lon) ||
    lat < -90 || lat > 90 ||
    lon < -180 || lon > 180
  ) {
    return null;
  }

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  // Validate output
  if (isNaN(x) || isNaN(y) || isNaN(z)) {
    return null;
  }

  return new THREE.Vector3(x, y, z);
};

// Custom Line Component using THREE.js primitives
function CountryLine({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} />
    </line>
  );
}

// Globe Scene Component
function GlobeScene({
  geoData,
  hoveredCountry,
  onCountryHover,
  onCountryClick,
  countriesByIso3,
}: {
  geoData: GeoJSONData;
  hoveredCountry: string | null;
  onCountryHover: (countryCode: string | null) => void;
  onCountryClick: (country: CountryData) => void;
  countriesByIso3: Record<string, CountryData>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Auto-rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const getCountryColor = (iso3: string, isHovered: boolean) => {
    const countryData = countriesByIso3[iso3];
    if (!countryData) return isHovered ? theme.colors.primary.blue : theme.colors.neutral[300];

    if (isHovered) return theme.colors.primary.blue;

    switch (countryData.status) {
      case 'home':
      case 'lived':
        return theme.colors.primary.blue;
      case 'visited':
        return theme.colors.primary.blueHover;
      case 'wishlist':
        return theme.colors.brand.sunset;
      case 'friends-only':
        return theme.colors.brand.goldenHour;
      default:
        return theme.colors.neutral[700];
    }
  };

  return (
    <>
      <perspectiveCamera position={[0, 0, 350]} fov={50} />
      <ambientLight intensity={0.5} />
      <pointLight position={[200, 200, 200]} intensity={0.6} />

      <group ref={groupRef}>
        {/* Ocean sphere */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 32]} />
          <meshStandardMaterial color="#0D52CE" flatShading />
        </mesh>

        {/* Atmospheric glow */}
        <mesh scale={1.1}>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 32]} />
          <meshBasicMaterial
            color="#00DDFF"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>

      {/* Country outlines */}
      {geoData.features.map((feature, featureIdx) => {
        const { ADMIN: countryName, ISO_A3: countryCode } = feature.properties;
        const coords = feature.geometry.coordinates;
        const isHovered = hoveredCountry === countryCode;
        const color = getCountryColor(countryCode, isHovered);

        // Skip features without valid country code
        if (!countryCode || typeof countryCode !== 'string') {
          console.warn('Skipping feature with invalid country code:', countryCode);
          return null;
        }

        return (
          <group
            key={`${countryCode}-${featureIdx}`}
            onPointerOver={() => onCountryHover(countryCode)}
            onPointerOut={() => onCountryHover(null)}
            onClick={() => {
              const countryData = countriesByIso3[countryCode];
              if (countryData) {
                onCountryClick(countryData);
              }
            }}
          >
            {coords.map((polygon: any, idx: number) => {
              const rings = feature.geometry.type === 'MultiPolygon' ? polygon : [polygon];
              return rings.map((ring: any, rIdx: number) => {
                try {
                  // Convert coordinates and filter out invalid ones
                  const points3D = ring
                    .map(([lon, lat]: [number, number]) => {
                      const point = latLonToSphere(lat, lon, GLOBE_RADIUS + 0.3);
                      // Additional validation: check Vector3 components for NaN
                      if (point && !isNaN(point.x) && !isNaN(point.y) && !isNaN(point.z)) {
                        return point;
                      }
                      return null;
                    })
                    .filter((point: THREE.Vector3 | null) => point !== null) as THREE.Vector3[];

                  // Skip if we don't have at least 2 valid points
                  if (points3D.length < 2) {
                    return null;
                  }

                  // Validate all points before rendering
                  const hasInvalidPoint = points3D.some(
                    (p) => isNaN(p.x) || isNaN(p.y) || isNaN(p.z)
                  );
                  if (hasInvalidPoint) {
                    console.warn(`Skipping line for ${countryCode}: contains NaN values`);
                    return null;
                  }

                  // Close the loop
                  if (!points3D[0].equals(points3D[points3D.length - 1])) {
                    points3D.push(points3D[0].clone());
                  }

                  return (
                    <CountryLine
                      key={`${countryCode}-${featureIdx}-${idx}-${rIdx}`}
                      points={points3D}
                      color={color}
                    />
                  );
                } catch (error) {
                  console.error(`Error rendering ring for ${countryCode}:`, error);
                  return null;
                }
              });
            })}
          </group>
        );
      })}
      </group>
    </>
  );
}

// Loading Component
function LoadingGlobe() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary.blue} />
    </View>
  );
}

// Main Component
export function PoliticalGlobe({ onCountrySelect, countriesByIso3 = {} }: PoliticalGlobeProps) {
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load GeoJSON data (prefer bundled asset to avoid network issues)
  useEffect(() => {
    try {
      let data = (localTopo as any)?.default ?? (localTopo as any);

      // If we have pure GeoJSON FeatureCollection, use it directly
      if (data?.type === 'FeatureCollection' && Array.isArray(data.features)) {
        setGeoData(data as GeoJSONData);
        console.log('[PoliticalGlobe] Loaded GeoJSON features:', data.features.length);
      } else {
        // Otherwise treat as Topology
        if (!data?.objects) {
          // Fallback to world-atlas package if bundled file fails
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const worldAtlasTopo = require('world-atlas/countries-110m.json');
          data = (worldAtlasTopo as any)?.default ?? (worldAtlasTopo as any);
        }

        console.log('[PoliticalGlobe] Raw topo keys:', data ? Object.keys(data) : 'topo undefined');

        const objects = data?.objects;
        const objectKeys = objects ? Object.keys(objects) : [];
        const countriesKey =
          objectKeys.find(k => k.toLowerCase().includes('countries')) || objectKeys[0];

        if (!objects || !countriesKey) {
          throw new Error('No countries object found in topojson');
        }

        const geo = topojson.feature(data, objects[countriesKey]) as GeoJSONData;
        setGeoData(geo);
        console.log('[PoliticalGlobe] Loaded topo features:', Array.isArray((geo as any).features) ? (geo as any).features.length : 0);
      }
    } catch (error) {
      console.error('Failed to load local GeoJSON:', error);
      setLoadError((error as Error)?.message || 'Unknown globe load error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCountryClick = useCallback((country: CountryData) => {
    onCountrySelect?.(country);
  }, [onCountrySelect]);

  if (loading) {
    return <LoadingGlobe />;
  }

  if (!geoData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.blue} />
      </View>
    );
  }

  console.log('[PoliticalGlobe] Rendering canvas with countries:', (geoData as any).features?.length);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <GlobeScene
          geoData={geoData}
          hoveredCountry={hoveredCountry}
          onCountryHover={setHoveredCountry}
          onCountryClick={handleCountryClick}
          countriesByIso3={countriesByIso3}
        />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
});
// @ts-nocheck
