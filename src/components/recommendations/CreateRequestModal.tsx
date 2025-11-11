/**
 * CreateRequestModal Component
 *
 * Modal for creating a new recommendation request
 * Features text input and friend selector
 */

import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { H2, Body, Caption } from '@/components/ui/Text';
import { FriendSelectorModal } from './FriendSelectorModal';
import { useCreateRequest } from '@/hooks/useRecommendations';
import { useFriendsNetwork } from '@/lib/api-hooks';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

interface CreateRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateRequestModal({
  visible,
  onClose,
  onSuccess,
}: CreateRequestModalProps) {
  const [message, setMessage] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [showFriendSelector, setShowFriendSelector] = useState(false);

  const { data: friendsNetwork } = useFriendsNetwork();
  const createRequestMutation = useCreateRequest();

  const friends = friendsNetwork?.friends || [];
  const selectedFriends = friends.filter(f => selectedFriendIds.includes(f.userId));

  const handleCreate = async () => {
    if (!message.trim()) {
      Alert.alert('Required', 'Please enter a message for your request');
      return;
    }

    try {
      await createRequestMutation.mutateAsync({
        message: message.trim(),
        recipient_ids: selectedFriendIds.length > 0 ? selectedFriendIds : undefined,
      });

      // Success!
      setMessage('');
      setSelectedFriendIds([]);
      onSuccess?.();
      onClose();

      Alert.alert(
        'Request Sent!',
        selectedFriendIds.length > 0
          ? `Your request was sent to ${selectedFriendIds.length} ${selectedFriendIds.length === 1 ? 'friend' : 'friends'}`
          : 'Your request was sent to all friends'
      );
    } catch (error) {
      console.error('Failed to create request:', error);
      Alert.alert('Error', 'Failed to create request. Please try again.');
    }
  };

  const handleCancel = () => {
    setMessage('');
    setSelectedFriendIds([]);
    onClose();
  };

  const handleRemoveFriend = (friendId: string) => {
    setSelectedFriendIds(prev => prev.filter(id => id !== friendId));
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={handleCancel} hitSlop={8}>
                <Ionicons name="close" size={28} color={colors.neutral[900]} />
              </Pressable>
              <H2>Create Request</H2>
              <View style={{ width: 28 }} />
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Message Input */}
              <View style={styles.section}>
                <Body weight="semibold" style={styles.label}>
                  What are you looking for?
                </Body>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="e.g., Best coffee shops with good wifi in Barcelona"
                  placeholderTextColor={colors.neutral[500]}
                  style={styles.textInput}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus
                />
                <Caption color={colors.neutral[600]} style={styles.hint}>
                  Be specific to get better recommendations!
                </Caption>
              </View>

              {/* Friend Selector */}
              <View style={styles.section}>
                <View style={styles.labelRow}>
                  <Body weight="semibold" style={styles.label}>
                    Send to
                  </Body>
                  <Caption color={colors.neutral[600]}>
                    {selectedFriendIds.length === 0 ? 'All friends' : `${selectedFriendIds.length} selected`}
                  </Caption>
                </View>

                <Pressable
                  style={styles.friendSelectorButton}
                  onPress={() => setShowFriendSelector(true)}
                >
                  <Ionicons name="people-outline" size={20} color={colors.primary.blue} />
                  <Body color={colors.primary.blue} style={styles.friendSelectorText}>
                    {selectedFriendIds.length === 0
                      ? 'Send to all friends'
                      : 'Select specific friends'}
                  </Body>
                  <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                </Pressable>

                {/* Selected Friends */}
                {selectedFriends.length > 0 && (
                  <View style={styles.selectedFriendsContainer}>
                    {selectedFriends.map((friend) => (
                      <View key={friend.userId} style={styles.selectedFriendChip}>
                        <Caption>{friend.name}</Caption>
                        <Pressable
                          onPress={() => handleRemoveFriend(friend.userId)}
                          hitSlop={8}
                        >
                          <Ionicons name="close-circle" size={16} color={colors.neutral[600]} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}

                <Caption color={colors.neutral[600]} style={styles.hint}>
                  {selectedFriendIds.length === 0
                    ? 'Your request will be visible to all your friends'
                    : 'Only selected friends will see this request'}
                </Caption>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Button
                variant="secondary"
                onPress={handleCancel}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleCreate}
                disabled={!message.trim() || createRequestMutation.isPending}
                isLoading={createRequestMutation.isPending}
                fullWidth
              >
                Send Request
              </Button>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Friend Selector Modal */}
      <FriendSelectorModal
        visible={showFriendSelector}
        onClose={() => setShowFriendSelector(false)}
        onConfirm={setSelectedFriendIds}
        multiSelect={true}
        title="Select Friends"
        confirmLabel="Done"
        selectedIds={selectedFriendIds}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[4],
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.pagePaddingMobile,
    paddingBottom: spacing[8],
  },
  section: {
    marginBottom: spacing[6],
  },
  label: {
    marginBottom: spacing[2],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  textInput: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: 16,
    color: colors.neutral[900],
    minHeight: 100,
  },
  hint: {
    marginTop: spacing[2],
    fontStyle: 'italic',
  },
  friendSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  friendSelectorText: {
    flex: 1,
  },
  selectedFriendsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  selectedFriendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.primary.blue + '15',
    borderRadius: borderRadius.full,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[4],
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
