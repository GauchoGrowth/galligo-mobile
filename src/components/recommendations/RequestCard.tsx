/**
 * RequestCard Component
 *
 * Displays a recommendation request from a friend
 * Shows requester info, message, response count, and action button
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Body, Caption } from '@/components/ui/Text';
import { theme } from '@/theme';
import type { RecommendationRequest } from '@/types/shared';

const { colors, spacing, borderRadius, shadows } = theme;

interface RequestCardProps {
  request: RecommendationRequest;
  onSendRec: () => void;
  onPress?: () => void;
}

export function RequestCard({ request, onSendRec, onPress }: RequestCardProps) {
  const isOwnRequest = false; // TODO: Check if request.user_id === currentUser.id

  // Parse date for "time ago" display
  const createdDate = new Date(request.created_at);
  const now = new Date();
  const hoursDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
  const daysDiff = Math.floor(hoursDiff / 24);

  let timeAgo = '';
  if (hoursDiff < 1) {
    timeAgo = 'Just now';
  } else if (hoursDiff < 24) {
    timeAgo = `${hoursDiff}h ago`;
  } else if (daysDiff === 1) {
    timeAgo = 'Yesterday';
  } else if (daysDiff < 7) {
    timeAgo = `${daysDiff}d ago`;
  } else {
    timeAgo = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {/* Header: Avatar, Name, Time */}
        <View style={styles.header}>
          <Avatar
            src={request.requester.avatarUrl}
            initials={request.requester.name.substring(0, 2)}
            size="md"
          />
          <View style={styles.headerText}>
            <Body weight="semibold">{request.requester.name}</Body>
            <View style={styles.metadata}>
              <Caption color={colors.neutral[600]}>{timeAgo}</Caption>
              {request.responseCount > 0 && (
                <>
                  <Caption color={colors.neutral[400]}> • </Caption>
                  <Caption color={colors.neutral[600]}>
                    {request.responseCount} {request.responseCount === 1 ? 'response' : 'responses'}
                  </Caption>
                </>
              )}
            </View>
          </View>
          {request.status === 'resolved' && (
            <View style={styles.resolvedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          )}
        </View>

        {/* Request Message */}
        <View style={styles.messageContainer}>
          <Body color={colors.neutral[900]}>{request.message}</Body>
        </View>

        {/* Action Button */}
        {!isOwnRequest && request.status === 'active' && (
          <Button
            variant="primary"
            size="sm"
            onPress={() => {
              onSendRec();
            }}
          >
            Send Rec
          </Button>
        )}

        {isOwnRequest && (
          <View style={styles.ownRequestIndicator}>
            <Caption color={colors.neutral[500]}>Your request</Caption>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    ...shadows[1],
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  headerText: {
    flex: 1,
    marginLeft: spacing[3],
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  resolvedBadge: {
    marginLeft: spacing[2],
  },
  messageContainer: {
    marginBottom: spacing[4],
    paddingHorizontal: spacing[1],
  },
  ownRequestIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
  },
});
