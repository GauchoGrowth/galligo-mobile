import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
// import { BlurView } from 'expo-blur'; // Commented out - will add later
import { theme } from '@/theme';

interface CountryData {
  iso2: string;
  iso3: string;
  name: string;
  status?: string;
  tripCount?: number;
  placeCount?: number;
}

interface CountryDetailPanelProps {
  country: CountryData | null;
  visible: boolean;
  onClose: () => void;
}

export function CountryDetailPanel({ country, visible, onClose }: CountryDetailPanelProps) {
  const translateY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withSpring(600, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [visible]);

  const panelAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible && !country) return null;

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropAnimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={styles.backdropOverlay} />
        </Pressable>
      </Animated.View>

      {/* Panel */}
      <Animated.View style={[styles.panel, panelAnimStyle]}>
        <View style={styles.handleBar} />

        <ScrollView style={styles.content} bounces={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.countryName}>{country?.name || 'Unknown'}</Text>
              <Text style={styles.countrySubtitle}>
                {country?.tripCount || 0} trips • {country?.placeCount || 0} places
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Country info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {country?.status?.toUpperCase() || 'UNSEEN'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Travel Log</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                Add Place
              </Text>
            </TouchableOpacity>
          </View>

          {/* Return to Orbit button */}
          <TouchableOpacity style={styles.returnButton} onPress={onClose}>
            <Text style={styles.returnButtonText}>← Return to Orbit</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing[4],
  },
  countryName: {
    fontFamily: 'OutfitSemiBold',
    fontSize: 28,
    color: theme.colors.text.primary,
  },
  countrySubtitle: {
    fontFamily: 'RobotoRegular',
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontFamily: 'OutfitMedium',
    fontSize: 12,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing[2],
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: 'OutfitBold',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 1,
  },
  actionButton: {
    backgroundColor: theme.colors.primary.blue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary.blue,
  },
  actionButtonText: {
    fontFamily: 'OutfitSemiBold',
    fontSize: 16,
    color: '#fff',
  },
  actionButtonTextSecondary: {
    color: theme.colors.primary.blue,
  },
  returnButton: {
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  returnButtonText: {
    fontFamily: 'OutfitMedium',
    fontSize: 16,
    color: theme.colors.primary.blue,
  },
});
