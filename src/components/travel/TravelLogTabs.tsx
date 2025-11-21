/**
 * TravelLogTabs Component
 *
 * iOS-style segmented control for Travel Log page
 * Switches between Travel Footprint, Journal, and Milestones
 * Revamped for a modern, pill-shaped aesthetic
 */

import React from 'react';
import { View, Pressable, StyleSheet, LayoutAnimation, Platform } from 'react-native';
import { Body } from '@/components/ui';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

const { colors, spacing, borderRadius } = theme;

export type TravelLogTab = 'footprint' | 'journal' | 'milestones';

interface TravelLogTabsProps {
  activeTab: TravelLogTab;
  onTabChange: (tab: TravelLogTab) => void;
}

const tabs: Array<{ key: TravelLogTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'footprint', label: 'Footprint', icon: 'globe-outline' }, // Shortened label
  { key: 'journal', label: 'Journal', icon: 'book-outline' },
  { key: 'milestones', label: 'Milestones', icon: 'trophy-outline' },
];

export function TravelLogTabs({ activeTab, onTabChange }: TravelLogTabsProps) {
  const handleTabPress = (tab: TravelLogTab) => {
    if (tab !== activeTab) {
      // Animate the tab switch
      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      onTabChange(tab);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[styles.tab, isActive && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? colors.primary.blue : colors.neutral[500]}
                style={styles.tabIcon}
              />
              <Body
                size="sm"
                weight={isActive ? 'bold' : 'medium'}
                color={isActive ? colors.primary.blue : colors.neutral[500]}
              >
                {tab.label}
              </Body>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    backgroundColor: 'transparent', // Removed white background
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
    padding: 4, // Slightly more padding for the "track"
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    gap: 4,
  },
  tabActive: {
    backgroundColor: colors.primary.white,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabIcon: {
    // No specific style needed
  },
});
