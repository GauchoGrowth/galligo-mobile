/**
 * SendRecModal Component
 *
 * Modal for sending a recommendation to a friend
 * Features Google Places search, friend selector, and optional note
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { H2, H3, Body, Caption } from '@/components/ui/Text';
import { FriendSelectorModal } from './FriendSelectorModal';
import { useSendRecommendation } from '@/hooks/useRecommendations';
import { usePlaceSearch, convertGooglePlaceToPlace } from '@/hooks/usePlaceSearch';
import { useFriendsNetwork } from '@/lib/api-hooks';
import type { PlaceSearchResult } from '@/hooks/usePlaceSearch';
import { theme } from '@/theme';
import { supabase } from '@/lib/supabase';

const { colors, spacing, borderRadius } = theme;

interface SendRecModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  requestId?: string; // If responding to a request
}

export function SendRecModal({
  visible,
  onClose,
  onSuccess,
  requestId,
}: SendRecModalProps) {
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [showFriendSelector, setShowFriendSelector] = useState(false);

  const { data: friendsNetwork } = useFriendsNetwork();
  const { data: searchResults, isLoading: isSearching } = usePlaceSearch({
    query: searchQuery,
    enabled: searchQuery.length > 2,
  });
  const sendRecMutation = useSendRecommendation();

  const friends = friendsNetwork?.friends || [];
  const selectedFriend = friends.find(f => f.userId === selectedFriendId);

  const handleSelectPlace = (place: PlaceSearchResult) => {
    setSelectedPlace(place);
    setStep('details');
  };

  const handleSend = async () => {
    if (!selectedPlace || !selectedFriendId) {
      Alert.alert('Required', 'Please select a place and a friend');
      return;
    }

    try {
      // First, create the place in our database if it doesn't exist
      const placeData = convertGooglePlaceToPlace(selectedPlace);

      // Check if place already exists
      const { data: existingPlace } = await supabase
        .from('places')
        .select('id')
        .eq('google_place_id', placeData.google_place_id)
        .maybeSingle();

      let placeId: string;

      if (existingPlace) {
        placeId = existingPlace.id;
      } else {
        // Create new place
        const { data: newPlace, error: createError } = await supabase
          .from('places')
          .insert(placeData)
          .select('id')
          .single();

        if (createError || !newPlace) {
          throw new Error('Failed to create place');
        }

        placeId = newPlace.id;
      }

      // Send the recommendation
      await sendRecMutation.mutateAsync({
        place_id: placeId,
        recipient_id: selectedFriendId,
        notes: note.trim() || undefined,
        request_id: requestId,
      });

      // Success!
      setSearchQuery('');
      setSelectedPlace(null);
      setSelectedFriendId(null);
      setNote('');
      setStep('search');
      onSuccess?.();
      onClose();

      Alert.alert(
        'Recommendation Sent!',
        `${selectedPlace.name} was recommended to ${selectedFriend?.name}`
      );
    } catch (error) {
      console.error('Failed to send recommendation:', error);
      Alert.alert('Error', 'Failed to send recommendation. Please try again.');
    }
  };

  const handleCancel = () => {
    setSearchQuery('');
    setSelectedPlace(null);
    setSelectedFriendId(null);
    setNote('');
    setStep('search');
    onClose();
  };

  const handleBack = () => {
    setSelectedPlace(null);
    setStep('search');
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
              {step === 'details' ? (
                <Pressable onPress={handleBack} hitSlop={8}>
                  <Ionicons name="arrow-back" size={28} color={colors.neutral[900]} />
                </Pressable>
              ) : (
                <Pressable onPress={handleCancel} hitSlop={8}>
                  <Ionicons name="close" size={28} color={colors.neutral[900]} />
                </Pressable>
              )}
              <H2>{step === 'search' ? 'Find a Place' : 'Send Recommendation'}</H2>
              <View style={{ width: 28 }} />
            </View>

            {/* Content */}
            {step === 'search' ? (
              <>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color={colors.neutral[500]} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search for a place..."
                    placeholderTextColor={colors.neutral[500]}
                    style={styles.searchInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                      <Ionicons name="close-circle" size={20} color={colors.neutral[500]} />
                    </Pressable>
                  )}
                </View>

                {/* Search Results */}
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                  {isSearching ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={colors.primary.blue} />
                      <Caption color={colors.neutral[600]} style={styles.loadingText}>
                        Searching places...
                      </Caption>
                    </View>
                  ) : searchQuery.length <= 2 ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search-outline" size={48} color={colors.neutral[400]} />
                      <Body color={colors.neutral[600]} style={styles.emptyText}>
                        Type at least 3 characters to search
                      </Body>
                    </View>
                  ) : searchResults && searchResults.length > 0 ? (
                    searchResults.map((place) => (
                      <Pressable
                        key={place.place_id}
                        style={({ pressed }) => [
                          styles.placeResult,
                          pressed && styles.placeResultPressed,
                        ]}
                        onPress={() => handleSelectPlace(place)}
                      >
                        <Ionicons name="location" size={24} color={colors.primary.blue} />
                        <View style={styles.placeInfo}>
                          <Body weight="semibold" numberOfLines={1}>
                            {place.name}
                          </Body>
                          <Caption color={colors.neutral[600]} numberOfLines={2}>
                            {place.formatted_address}
                          </Caption>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                      </Pressable>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="sad-outline" size={48} color={colors.neutral[400]} />
                      <Body color={colors.neutral[600]} style={styles.emptyText}>
                        No places found
                      </Body>
                    </View>
                  )}
                </ScrollView>
              </>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* Selected Place */}
                <View style={styles.section}>
                  <Body weight="semibold" style={styles.label}>
                    Place
                  </Body>
                  <View style={styles.selectedPlaceCard}>
                    <Ionicons name="location" size={24} color={colors.primary.blue} />
                    <View style={styles.selectedPlaceInfo}>
                      <H3 numberOfLines={1}>{selectedPlace?.name}</H3>
                      <Caption color={colors.neutral[600]} numberOfLines={2}>
                        {selectedPlace?.formatted_address}
                      </Caption>
                    </View>
                  </View>
                </View>

                {/* Friend Selector */}
                <View style={styles.section}>
                  <Body weight="semibold" style={styles.label}>
                    Send to
                  </Body>
                  <Pressable
                    style={styles.friendSelectorButton}
                    onPress={() => setShowFriendSelector(true)}
                  >
                    {selectedFriend ? (
                      <>
                        <Ionicons name="person" size={20} color={colors.primary.blue} />
                        <Body style={styles.friendSelectorText}>{selectedFriend.name}</Body>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                      </>
                    ) : (
                      <>
                        <Ionicons name="person-outline" size={20} color={colors.neutral[500]} />
                        <Body color={colors.neutral[600]} style={styles.friendSelectorText}>
                          Select a friend
                        </Body>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                      </>
                    )}
                  </Pressable>
                </View>

                {/* Note (Optional) */}
                <View style={styles.section}>
                  <Body weight="semibold" style={styles.label}>
                    Add a note (optional)
                  </Body>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="e.g., Best pasta I've ever had! Try the carbonara."
                    placeholderTextColor={colors.neutral[500]}
                    style={styles.textInput}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>
            )}

            {/* Footer (only on details step) */}
            {step === 'details' && (
              <View style={styles.footer}>
                <Button
                  variant="secondary"
                  onPress={handleBack}
                  fullWidth
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onPress={handleSend}
                  disabled={!selectedPlace || !selectedFriendId || sendRecMutation.isPending}
                  isLoading={sendRecMutation.isPending}
                  fullWidth
                >
                  Send
                </Button>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Friend Selector Modal */}
      <FriendSelectorModal
        visible={showFriendSelector}
        onClose={() => setShowFriendSelector(false)}
        onConfirm={(ids) => setSelectedFriendId(ids[0] || null)}
        multiSelect={false}
        title="Select Friend"
        confirmLabel="Select"
        selectedIds={selectedFriendId ? [selectedFriendId] : []}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  loadingContainer: {
    paddingTop: spacing[12],
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
  },
  emptyContainer: {
    paddingTop: spacing[12],
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  emptyText: {
    marginTop: spacing[3],
    textAlign: 'center',
  },
  placeResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    backgroundColor: colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  placeResultPressed: {
    backgroundColor: colors.neutral[50],
  },
  placeInfo: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.pagePaddingMobile,
    marginBottom: spacing[6],
    marginTop: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
  },
  selectedPlaceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.primary.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  selectedPlaceInfo: {
    flex: 1,
  },
  friendSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing[3],
  },
  friendSelectorText: {
    flex: 1,
  },
  textInput: {
    backgroundColor: colors.primary.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: 16,
    color: colors.neutral[900],
    minHeight: 80,
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
