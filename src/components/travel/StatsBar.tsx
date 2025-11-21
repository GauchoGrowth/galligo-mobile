import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { theme } from '@/theme';

interface StatsPillProps {
  emoji: string;
  text: string;
  isNew?: boolean;
  onPress?: () => void;
}

function StatsPill({ emoji, text, isNew, onPress }: StatsPillProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { stiffness: 170, damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 170, damping: 15 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.statsPill, isNew ? styles.statsPillNew : styles.statsPillDefault]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        {isNew && <View style={styles.newLabel}>
          <Text style={styles.newLabelText}>NEW</Text>
        </View>}
        <Text style={styles.pillEmoji}>{emoji}</Text>
        <Text style={[styles.pillText, isNew && styles.newText]}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface StatsBarProps {
  countriesCount?: number;
  citiesCount?: number;
  newThisMonth?: number;
}

export function StatsBar({ countriesCount = 14, citiesCount = 62, newThisMonth = 3 }: StatsBarProps) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.statsContainer}
      showsHorizontalScrollIndicator={false}
    >
      <StatsPill
        emoji="🌍"
        text={`${countriesCount} Countries`}
      />
      <StatsPill
        emoji="📍"
        text={`${citiesCount} Cities`}
      />
      <StatsPill
        emoji="✨"
        text={`+${newThisMonth} this month`}
        isNew
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statsPillDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  statsPillNew: {
    backgroundColor: theme.colors.primary.blue,
    shadowColor: theme.colors.primary.blue,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  pillEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  pillText: {
    fontFamily: 'OutfitMedium',
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  newLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  newLabelText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'OutfitBold',
    letterSpacing: 1,
  },
  newText: {
    color: '#fff',
  },
});
