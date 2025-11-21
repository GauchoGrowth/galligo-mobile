import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { theme } from '@/theme';

interface GlobeTooltipProps {
  countryName: string;
  countryStats?: string;
  flagUri?: string;
  visible: boolean;
}

export function GlobeTooltip({ countryName, countryStats, flagUri, visible }: GlobeTooltipProps) {
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { stiffness: 170, damping: 15 });
    } else {
      scale.value = withSpring(0.9, { stiffness: 170, damping: 15 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={[styles.tooltip, animatedStyle]}
    >
      {flagUri && (
        <Image
          source={{ uri: flagUri }}
          style={styles.tooltipImage}
        />
      )}
      <View>
        <Text style={styles.tooltipTitle}>{countryName}</Text>
        {countryStats && (
          <Text style={styles.tooltipSubtitle}>{countryStats}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -40 }],
    width: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral[100],
  },
  tooltipTitle: {
    fontFamily: 'OutfitSemiBold',
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  tooltipSubtitle: {
    fontFamily: 'RobotoRegular',
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});
