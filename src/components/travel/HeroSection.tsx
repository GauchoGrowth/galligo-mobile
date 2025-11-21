import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { PoliticalGlobe } from '@/components/globe/PoliticalGlobe';
import { GlobeTooltip } from '@/components/globe/GlobeTooltip';
import { StatsBar } from './StatsBar';

interface CountryData {
  iso2: string;
  iso3: string;
  name: string;
  status?: 'home' | 'lived' | 'visited' | 'wishlist' | 'friends-only' | 'unseen';
}

interface HeroSectionProps {
  scrollY: SharedValue<number>;
  onCountrySelect?: (country: CountryData | null) => void;
  countriesByIso3?: Record<string, CountryData>;
  countriesCount?: number;
  citiesCount?: number;
  newThisMonth?: number;
}

export function HeroSection({
  scrollY,
  onCountrySelect,
  countriesByIso3,
  countriesCount,
  citiesCount,
  newThisMonth,
}: HeroSectionProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);

  const globeAnimStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    const scale = Math.max(0.6, 1 - 0.0015 * y);
    const translateY = 0.5 * y;
    const opacity = Math.max(0, 1 - 0.003 * y);
    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const handleCountrySelect = (country: CountryData | null) => {
    if (country) {
      setHoveredCountry(country);
      setTooltipVisible(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setTooltipVisible(false), 3000);
    } else {
      setTooltipVisible(false);
    }
    onCountrySelect?.(country);
  };

  return (
    <View style={styles.heroContainer}>
      <LinearGradient
        colors={['#FAFAFA', '#E0F9FF', '#FAFAFA']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.globeWrapper, globeAnimStyle]}>
        <View style={styles.globeContainer}>
          <PoliticalGlobe
            onCountrySelect={handleCountrySelect}
            countriesByIso3={countriesByIso3}
          />

          {/* Tooltip */}
          {tooltipVisible && hoveredCountry && (
            <GlobeTooltip
              countryName={hoveredCountry.name}
              countryStats={`Status: ${hoveredCountry.status || 'unseen'}`}
              visible={tooltipVisible}
            />
          )}
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBarWrapper}>
          <StatsBar
            countriesCount={countriesCount}
            citiesCount={citiesCount}
            newThisMonth={newThisMonth}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 420,
    position: 'relative',
  },
  globeWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  globeContainer: {
    marginTop: 64,
    position: 'relative',
  },
  statsBarWrapper: {
    position: 'absolute',
    bottom: 48,
    width: '100%',
  },
});
