import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { theme } from '@/theme';

interface TravelLogHeaderProps {
  scrollY: SharedValue<number>;
  profileImageUri?: string;
  onProfilePress?: () => void;
}

export function TravelLogHeader({ scrollY, profileImageUri, onProfilePress }: TravelLogHeaderProps) {
  const headerAnim = useAnimatedStyle(() => {
    const scrolled = scrollY.value;
    return {
      paddingTop: scrolled > 40 ? 10 : 44,
      paddingBottom: scrolled > 40 ? 12 : 16,
      backgroundColor: scrolled > 40 ? 'rgba(250, 250, 250, 0.85)' : 'transparent',
      borderBottomWidth: scrolled > 40 ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    };
  });

  const titleAnim = useAnimatedStyle(() => {
    const scrolled = scrollY.value;
    return {
      fontSize: scrolled > 40 ? 18 : 30,
      transform: [{ translateY: scrolled > 40 ? 2 : 0 }],
    };
  });

  const subtitleAnim = useAnimatedStyle(() => {
    const scrolled = scrollY.value;
    return {
      opacity: scrolled > 40 ? 0 : 1,
      height: scrolled > 40 ? 0 : undefined,
    };
  });

  return (
    <Animated.View style={[styles.headerContainer, headerAnim]}>
      <View style={styles.titleContainer}>
        <Animated.Text style={[styles.headerTitle, titleAnim]}>
          Your Travel Log
        </Animated.Text>
        <Animated.Text style={[styles.headerSubtitle, subtitleAnim]}>
          Your adventures, mapped beautifully.
        </Animated.Text>
      </View>
      <TouchableOpacity style={styles.avatarContainer} onPress={onProfilePress}>
        <Image
          source={{ uri: profileImageUri || 'https://via.placeholder.com/40' }}
          style={styles.avatarImage}
        />
        <View style={styles.activeDot} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing[4],
    zIndex: 100,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'OutfitSemiBold',
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: 'RobotoRegular',
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary.blue,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
