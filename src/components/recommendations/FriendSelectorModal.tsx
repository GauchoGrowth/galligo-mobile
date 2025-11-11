/**
 * FriendSelectorModal Component
 *
 * Modal for selecting friends (single or multi-select)
 * Used in CreateRequest and SendRec flows
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { H2, Body, Caption } from '@/components/ui/Text';
import { Spinner } from '@/components/ui/Spinner';
import { useFriendsNetwork } from '@/lib/api-hooks';
import { theme } from '@/theme';

const { colors, spacing, borderRadius } = theme;

interface Friend {
  userId: string;
  name: string;
  avatarUrl: string;
  placeCount?: number;
}

interface FriendSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedFriendIds: string[]) => void;
  multiSelect?: boolean;
  title?: string;
  confirmLabel?: string;
  selectedIds?: string[];
}

export function FriendSelectorModal({
  visible,
  onClose,
  onConfirm,
  multiSelect = false,
  title = 'Select Friends',
  confirmLabel = 'Confirm',
  selectedIds = [],
}: FriendSelectorModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [searchQuery, setSearchQuery] = useState('');

  const { data: friendsNetwork, isLoading } = useFriendsNetwork();
  const friends: Friend[] = friendsNetwork?.friends || [];

  // Filter friends based on search
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;

    const query = searchQuery.toLowerCase();
    return friends.filter(friend =>
      friend.name.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  const handleToggle = (friendId: string) => {
    if (!multiSelect) {
      // Single select: replace selection
      setSelected(new Set([friendId]));
    } else {
      // Multi select: toggle
      const newSelected = new Set(selected);
      if (newSelected.has(friendId)) {
        newSelected.delete(friendId);
      } else {
        newSelected.add(friendId);
      }
      setSelected(newSelected);
    }
  };

  const handleSelectAll = () => {
    if (selected.size === filteredFriends.length) {
      // Deselect all
      setSelected(new Set());
    } else {
      // Select all filtered friends
      setSelected(new Set(filteredFriends.map(f => f.userId)));
    }
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selected));
    onClose();
  };

  const handleCancel = () => {
    setSelected(new Set(selectedIds));
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleCancel} hitSlop={8}>
            <Ionicons name="close" size={28} color={colors.neutral[900]} />
          </Pressable>
          <H2>{title}</H2>
          <View style={{ width: 28 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral[500]} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search friends..."
            placeholderTextColor={colors.neutral[500]}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.neutral[500]} />
            </Pressable>
          )}
        </View>

        {/* Select All (multi-select only) */}
        {multiSelect && filteredFriends.length > 0 && (
          <View style={styles.selectAllContainer}>
            <Pressable
              style={styles.selectAllButton}
              onPress={handleSelectAll}
            >
              <Ionicons
                name={selected.size === filteredFriends.length ? 'checkbox' : 'square-outline'}
                size={24}
                color={selected.size === filteredFriends.length ? colors.primary.blue : colors.neutral[400]}
              />
              <Body style={styles.selectAllText}>
                {selected.size === filteredFriends.length ? 'Deselect All' : 'Select All'}
              </Body>
            </Pressable>
            <Caption color={colors.neutral[600]}>
              {selected.size} selected
            </Caption>
          </View>
        )}

        {/* Friends List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Spinner size="large" />
          </View>
        ) : filteredFriends.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors.neutral[400]} />
            <Body color={colors.neutral[600]} style={styles.emptyText}>
              {searchQuery ? 'No friends found' : 'No friends yet'}
            </Body>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredFriends.map((friend) => {
              const isSelected = selected.has(friend.userId);

              return (
                <Pressable
                  key={friend.userId}
                  style={({ pressed }) => [
                    styles.friendItem,
                    pressed && styles.friendItemPressed,
                    isSelected && styles.friendItemSelected,
                  ]}
                  onPress={() => handleToggle(friend.userId)}
                >
                  <Avatar
                    src={friend.avatarUrl}
                    initials={friend.name.substring(0, 2)}
                    size="md"
                  />
                  <View style={styles.friendInfo}>
                    <Body weight="semibold">{friend.name}</Body>
                    {friend.placeCount !== undefined && (
                      <Caption color={colors.neutral[600]}>
                        {friend.placeCount} {friend.placeCount === 1 ? 'place' : 'places'}
                      </Caption>
                    )}
                  </View>
                  <Ionicons
                    name={isSelected ? (multiSelect ? 'checkbox' : 'radio-button-on') : (multiSelect ? 'square-outline' : 'radio-button-off')}
                    size={24}
                    color={isSelected ? colors.primary.blue : colors.neutral[400]}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        )}

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
            onPress={handleConfirm}
            disabled={selected.size === 0}
            fullWidth
          >
            {confirmLabel}
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[4],
    backgroundColor: colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    backgroundColor: colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[900],
    paddingVertical: spacing[1],
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[100],
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  selectAllText: {
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  emptyText: {
    marginTop: spacing[3],
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing[2],
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    backgroundColor: colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  friendItemPressed: {
    backgroundColor: colors.neutral[50],
  },
  friendItemSelected: {
    backgroundColor: colors.primary.blue + '08',
  },
  friendInfo: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[4],
    backgroundColor: colors.primary.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
