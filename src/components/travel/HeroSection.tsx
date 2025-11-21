import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AmChartsGlobe } from '@/components/globe/AmChartsGlobe';
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
  visitedCountriesIso2?: string[];
}

export function HeroSection({
  scrollY,
  onCountrySelect,
  countriesByIso3,
  countriesCount,
  citiesCount,
  newThisMonth,
  visitedCountriesIso2,
}: HeroSectionProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [resetTrigger, setResetTrigger] = React.useState(0);

  const globeAnimStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    const scale = Math.max(0.9, 1 - 0.001 * y);
    const translateY = 0.3 * y;
    const opacity = Math.max(0, 1 - 0.002 * y);
    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  return (
    <View style={styles.heroContainer}>
      <LinearGradient
        colors={['#FAFAFA', '#E0F9FF', '#FAFAFA']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.globeWrapper, globeAnimStyle]}>
        <View
          style={[
            styles.globeContainer,
            isFocused && styles.globeContainerFocused,
          ]}
        >
          <AmChartsGlobe
            visitedCountries={visitedCountriesIso2 || []}
            showReset={isFocused}
            resetTrigger={resetTrigger}
            onReset={() => {
              setResetTrigger(t => t + 1);
              setIsFocused(false);
              onCountrySelect?.(null);
            }}
            onCountrySelect={(country) => {
              setIsFocused(true);
              const match = Object.values(countriesByIso3 || {}).find(
                c => c.iso2.toUpperCase() === country.id?.toUpperCase()
              );
              if (match) {
                onCountrySelect?.(match);
              } else {
                onCountrySelect?.({
                  iso2: country.id,
                  iso3: country.id,
                  name: country.name,
                  status: 'unseen',
                });
              }
            }}
          />
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
    marginTop: 24,
    position: 'relative',
    width: '100%',
    height: 360,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF7FF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  globeContainerFocused: {
    height: 520,
    borderRadius: 32,
    transform: [{ translateY: -80 }],
  },
  statsBarWrapper: {
    position: 'absolute',
    bottom: 48,
    width: '100%',
  },
});
