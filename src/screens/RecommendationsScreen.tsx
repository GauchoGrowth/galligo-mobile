/**
 * Recommendations Screen - GalliGo React Native
 *
 * Main screen for recommendation requests and received/sent recommendations
 * Features iOS segmented control tabs and native gestures
 */

import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { H1, Caption } from '@/components/ui/Text';
import { Spinner } from '@/components/ui/Spinner';
import {
  RequestCard,
  ReceivedRecCard,
  SentRecCard,
  WishlistCard,
  EmptyRecState,
  CreateRequestModal,
  SendRecModal,
} from '@/components/recommendations';
import {
  useRecommendationRequests,
  useReceivedRecommendations,
  useSentRecommendations,
  useWishlist,
} from '@/hooks/useRecommendations';
import { useToggleWishlist, useRemoveMarker } from '@/hooks/useMarkers';
import { theme } from '@/theme';

const { colors, spacing } = theme;

type TabIndex = 0 | 1 | 2 | 3;

const TABS = ['Requests', 'For You', 'Your Picks', 'Want to Go'] as const;

export function RecommendationsScreen() {
  const [selectedTab, setSelectedTab] = useState<TabIndex>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [showSendRecModal, setShowSendRecModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();

  // Data hooks
  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = useRecommendationRequests();
  const { data: received, isLoading: receivedLoading, refetch: refetchReceived } = useReceivedRecommendations();
  const { data: sent, isLoading: sentLoading, refetch: refetchSent } = useSentRecommendations();
  const { data: wishlist, isLoading: wishlistLoading, refetch: refetchWishlist } = useWishlist();

  // Mutations
  const toggleWishlistMutation = useToggleWishlist();
  const removeMarkerMutation = useRemoveMarker();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      switch (selectedTab) {
        case 0:
          await refetchRequests();
          break;
        case 1:
          await refetchReceived();
          break;
        case 2:
          await refetchSent();
          break;
        case 3:
          await refetchWishlist();
          break;
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleWishlist = (placeId: string) => {
    toggleWishlistMutation.mutate(placeId);
  };

  const handleRemoveFromWishlist = (placeId: string) => {
    removeMarkerMutation.mutate(placeId);
  };

  const handleCreateRequest = () => {
    setShowCreateRequestModal(true);
  };

  const handleSendRec = (requestId?: string) => {
    setSelectedRequestId(requestId);
    setShowSendRecModal(true);
  };

  const handleModalSuccess = async () => {
    // Refetch data after successful modal action
    await refetchRequests();
    await refetchReceived();
    await refetchSent();
  };

  // Determine which data to show based on selected tab
  const isLoading = [requestsLoading, receivedLoading, sentLoading, wishlistLoading][selectedTab];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <H1>Recommendations</H1>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControlContainer}>
        <SegmentedControl
          values={TABS}
          selectedIndex={selectedTab}
          onChange={(event) => {
            setSelectedTab(event.nativeEvent.selectedSegmentIndex as TabIndex);
          }}
          style={styles.segmentedControl}
          fontStyle={{ fontSize: 14, fontWeight: '600' }}
          activeFontStyle={{ fontSize: 14, fontWeight: '600' }}
        />
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.blue}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Spinner size="large" />
          </View>
        ) : (
          <>
            {/* Requests Tab */}
            {selectedTab === 0 && (
              <View style={styles.tabContent}>
                <View style={styles.tabHeader}>
                  <Caption color={colors.neutral[600]}>
                    {requests?.length || 0} active {requests?.length === 1 ? 'request' : 'requests'}
                  </Caption>
                </View>

                {requests && requests.length > 0 ? (
                  requests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onSendRec={() => handleSendRec(request.id)}
                      onPress={() => console.log('View request:', request.id)}
                    />
                  ))
                ) : (
                  <EmptyRecState type="requests" onAction={handleCreateRequest} />
                )}
              </View>
            )}

            {/* For You Tab */}
            {selectedTab === 1 && (
              <View style={styles.tabContent}>
                <View style={styles.tabHeader}>
                  <Caption color={colors.neutral[600]}>
                    {received?.length || 0} {received?.length === 1 ? 'recommendation' : 'recommendations'}
                  </Caption>
                </View>

                {received && received.length > 0 ? (
                  received.map((rec) => (
                    <ReceivedRecCard
                      key={rec.id}
                      recommendation={rec}
                      onToggleWishlist={() => handleToggleWishlist(rec.place_id)}
                      onPress={() => console.log('View place:', rec.place_id)}
                    />
                  ))
                ) : (
                  <EmptyRecState type="received" />
                )}
              </View>
            )}

            {/* Your Picks Tab */}
            {selectedTab === 2 && (
              <View style={styles.tabContent}>
                <View style={styles.tabHeader}>
                  <Caption color={colors.neutral[600]}>
                    {sent?.length || 0} {sent?.length === 1 ? 'recommendation' : 'recommendations'} sent
                  </Caption>
                </View>

                {sent && sent.length > 0 ? (
                  sent.map((rec) => (
                    <SentRecCard
                      key={rec.id}
                      recommendation={rec}
                      onPress={() => console.log('View place:', rec.place_id)}
                    />
                  ))
                ) : (
                  <EmptyRecState type="sent" onAction={() => handleSendRec()} />
                )}
              </View>
            )}

            {/* Want to Go Tab */}
            {selectedTab === 3 && (
              <View style={styles.tabContent}>
                <View style={styles.tabHeader}>
                  <Caption color={colors.neutral[600]}>
                    {wishlist?.length || 0} {wishlist?.length === 1 ? 'place' : 'places'} saved
                  </Caption>
                </View>

                {wishlist && wishlist.length > 0 ? (
                  wishlist.map((item) => (
                    <WishlistCard
                      key={item.id}
                      wishlistPlace={item}
                      onRemove={() => handleRemoveFromWishlist(item.place_id)}
                      onPress={() => console.log('View place:', item.place_id)}
                    />
                  ))
                ) : (
                  <EmptyRecState type="wishlist" />
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {(selectedTab === 0 || selectedTab === 2) && (
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
          onPress={() => {
            if (selectedTab === 0) {
              handleCreateRequest();
            } else {
              handleSendRec();
            }
          }}
        >
          <Ionicons name="add" size={28} color={colors.primary.white} />
        </Pressable>
      )}

      {/* Modals */}
      <CreateRequestModal
        visible={showCreateRequestModal}
        onClose={() => setShowCreateRequestModal(false)}
        onSuccess={handleModalSuccess}
      />

      <SendRecModal
        visible={showSendRecModal}
        onClose={() => {
          setShowSendRecModal(false);
          setSelectedRequestId(undefined);
        }}
        onSuccess={handleModalSuccess}
        requestId={selectedRequestId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    backgroundColor: colors.primary.white,
  },
  segmentedControlContainer: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    backgroundColor: colors.primary.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  segmentedControl: {
    height: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[20], // Extra padding for FAB
  },
  loadingContainer: {
    paddingTop: spacing[12],
    alignItems: 'center',
  },
  tabContent: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingTop: spacing[4],
  },
  tabHeader: {
    marginBottom: spacing[3],
  },
  fab: {
    position: 'absolute',
    bottom: spacing[6],
    right: spacing.pagePaddingMobile,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
