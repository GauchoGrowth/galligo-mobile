/**
 * 3D Globe Model Component
 * Loads GLB file and applies country/continent selection effects
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei/native';
import { useGlobeStore } from '@/stores/globeStore';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

interface GlobeModelProps {
  visitedCountries: string[]; // ISO codes of visited countries
}

export const GlobeModel: React.FC<GlobeModelProps> = ({ visitedCountries }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Load the pre-built globe GLB file
  const gltf = useGLTF(require('../../../assets/globe.glb')) as GLTF & { scene: THREE.Group };

  // Get selection state from store
  const selectedCountry = useGlobeStore((state) => state.selectedCountry);
  const selectedContinent = useGlobeStore((state) => state.selectedContinent);

  // Convert visited countries to lowercase for matching
  const visitedSet = useMemo(
    () => new Set(visitedCountries.map((c) => c.toLowerCase())),
    [visitedCountries]
  );

  // Apply visual effects based on selection and visited status
  useEffect(() => {
    if (!groupRef.current) return;

    console.log('[GlobeModel] Applying selection effects');
    console.log('[GlobeModel] Selected country:', selectedCountry);
    console.log('[GlobeModel] Visited countries:', visitedCountries.length);

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        // Get country data from Blender userData
        const countryCode = child.userData.iso_a2?.toLowerCase();
        const countryName = child.userData.name;
        const continent = child.userData.continent;

        // Ensure material supports transparency
        if (!Array.isArray(child.material)) {
          child.material.transparent = true;
          child.material.needsUpdate = true;

          const isVisited = countryCode && visitedSet.has(countryCode);
          const isSelected = countryCode === selectedCountry?.toLowerCase();

          if (selectedCountry) {
            // Country-level selection active
            if (isSelected) {
              // Highlight selected country
              child.material.opacity = 1.0;
              child.material.emissive = new THREE.Color(0x4a90e2); // Brand blue
              child.material.emissiveIntensity = 0.4;
            } else {
              // Fade non-selected countries significantly
              child.material.opacity = 0.15;
              child.material.emissive = new THREE.Color(0x000000);
              child.material.emissiveIntensity = 0;
            }
          } else if (selectedContinent) {
            // Continent-level selection active
            if (continent === selectedContinent) {
              child.material.opacity = isVisited ? 1.0 : 0.8;
            } else {
              child.material.opacity = 0.2;
            }

            // Highlight visited countries subtly
            if (isVisited) {
              child.material.emissive = new THREE.Color(0x4a90e2);
              child.material.emissiveIntensity = 0.2;
            }
          } else {
            // No selection - show all countries
            child.material.opacity = 1.0;

            // Highlight visited countries
            if (isVisited) {
              child.material.emissive = new THREE.Color(0x4a90e2);
              child.material.emissiveIntensity = 0.25;
            } else {
              child.material.emissive = new THREE.Color(0x000000);
              child.material.emissiveIntensity = 0;
            }
          }
        }
      }
    });
  }, [selectedCountry, selectedContinent, visitedSet, visitedCountries.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[GlobeModel] Cleaning up resources');

      if (gltf && gltf.scene) {
        gltf.scene.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();

            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
    };
  }, [gltf]);

  if (!gltf || !gltf.scene) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} scale={1.0} rotation={[0, 0, 0]} />
    </group>
  );
};

// Preload the globe model for faster initial render
useGLTF.preload(require('../../../assets/globe.glb'));
