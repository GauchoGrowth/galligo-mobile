/**
 * MilestonesView Component
 *
 * Displays user achievements and milestones with progress tracking
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Body, BodySmall, H2, H3 } from '@/components/ui';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
}

interface MilestonesViewProps {
  milestones: Milestone[];
}

export function MilestonesView({ milestones }: MilestonesViewProps) {
  // Mock milestones data for now
  const mockMilestones: Milestone[] = [
    {
      id: '1',
      name: 'Visit 50 States',
      description: 'Explore all 50 US states',
      icon: '🗺️',
      progress: 7,
      target: 50,
    },
    {
      id: '2',
      name: 'Metro Explorer',
      description: 'Visit 20 different cities',
      icon: '🏙️',
      progress: 13,
      target: 20,
    },
    {
      id: '3',
      name: 'Continental Quest',
      description: 'Visit all 7 continents',
      icon: '🌍',
      progress: 2,
      target: 7,
    },
  ];

  const displayMilestones = milestones.length > 0 ? milestones : mockMilestones;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <H2 weight="bold">
          Milestones
        </H2>
        <BodySmall color={colors.neutral[600]} style={styles.subtitle}>
          Single-goal achievements to unlock
        </BodySmall>
      </View>

      <View style={styles.milestones}>
        {displayMilestones.map((milestone) => (
          <MilestoneCard key={milestone.id} milestone={milestone} />
        ))}
      </View>
    </ScrollView>
  );
}

interface MilestoneCardProps {
  milestone: Milestone;
}

function MilestoneCard({ milestone }: MilestoneCardProps) {
  const percentage = Math.min((milestone.progress / milestone.target) * 100, 100);
  const isComplete = percentage === 100;

  return (
    <View style={styles.milestoneCard}>
      <View style={styles.milestoneHeader}>
        <View style={styles.iconContainer}>
          <H2>{milestone.icon}</H2>
        </View>
        <View style={styles.milestoneInfo}>
          <H3 weight="semibold">
            {milestone.name}
          </H3>
          <BodySmall color={colors.neutral[600]}>
            {milestone.description}
          </BodySmall>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isComplete ? colors.secondary.green : colors.primary.blue,
              },
            ]}
          />
        </View>
        <View style={styles.progressStats}>
          <BodySmall weight="medium">
            {milestone.progress} / {milestone.target}
          </BodySmall>
          <BodySmall weight="medium" color={isComplete ? colors.secondary.green : colors.primary.blue}>
            {Math.round(percentage)}%
          </BodySmall>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing[8],
  },
  header: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[4],
  },
  subtitle: {
    marginTop: spacing[1],
  },
  milestones: {
    gap: spacing[3],
    paddingHorizontal: spacing.pagePaddingMobile,
  },
  milestoneCard: {
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  progressContainer: {
    gap: spacing[2],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
