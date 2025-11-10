/**
 * Edit Trip Screen - GalliGo React Native
 *
 * Modal screen to edit an existing trip
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { H1, Body, Input, Button } from '@/components/ui';
import { useTrips, useUpdateTrip, useDeleteTrip } from '@/lib/api-hooks';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing, borderRadius } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'EditTrip'>;

export function EditTripScreen({ route, navigation }: Props) {
  const { tripId } = route.params;

  // Fetch all trips and find this one
  const { data: trips = [] } = useTrips();
  const trip = trips.find((t) => t.id === tripId);

  const updateTripMutation = useUpdateTrip();
  const deleteTripMutation = useDeleteTrip();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Initialize form with trip data
  useEffect(() => {
    if (trip) {
      setName(trip.name);
      setCity(trip.city);
      setCountry(trip.country);
      setStartDate(trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate));
      setEndDate(trip.endDate instanceof Date ? trip.endDate : new Date(trip.endDate));
      setDescription(trip.description || '');
    }
  }, [trip]);

  if (!trip) {
    navigation.goBack();
    return null;
  }

  const handleUpdate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter a trip name');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Missing Information', 'Please enter a city');
      return;
    }
    if (!country.trim()) {
      Alert.alert('Missing Information', 'Please enter a country');
      return;
    }
    if (endDate <= startDate) {
      Alert.alert('Invalid Dates', 'End date must be after start date');
      return;
    }

    try {
      await updateTripMutation.mutateAsync({
        id: tripId,
        name: name.trim(),
        city: city.trim(),
        country: country.trim(),
        startDate,
        endDate,
        description: description.trim() || undefined,
      });

      Alert.alert('Success', 'Trip updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update trip. Please try again.');
      console.error('Update trip error:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTripMutation.mutateAsync(tripId);
              Alert.alert('Success', 'Trip deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete trip. Please try again.');
              console.error('Delete trip error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={28} color={colors.neutral[900]} />
        </Pressable>
        <H1 style={styles.title}>Edit Trip</H1>
        <Pressable onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Name */}
        <View style={styles.field}>
          <Body weight="medium" style={styles.label}>
            Trip Name *
          </Body>
          <Input value={name} onChangeText={setName} placeholder="Summer in Europe" />
        </View>

        {/* Destination */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Body weight="medium" style={styles.label}>
              City *
            </Body>
            <Input value={city} onChangeText={setCity} placeholder="Paris" />
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Body weight="medium" style={styles.label}>
              Country *
            </Body>
            <Input value={country} onChangeText={setCountry} placeholder="France" />
          </View>
        </View>

        {/* Dates */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Body weight="medium" style={styles.label}>
              Start Date *
            </Body>
            <Pressable onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
              <Ionicons name="calendar-outline" size={20} color={colors.neutral[600]} />
              <Body color={colors.neutral[900]}>
                {startDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Body>
            </Pressable>
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Body weight="medium" style={styles.label}>
              End Date *
            </Body>
            <Pressable onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
              <Ionicons name="calendar-outline" size={20} color={colors.neutral[600]} />
              <Body color={colors.neutral[900]}>
                {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Body>
            </Pressable>
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Body weight="medium" style={styles.label}>
            Description (Optional)
          </Body>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us about this trip..."
            multiline
            numberOfLines={4}
            inputStyle={styles.textArea}
          />
        </View>

        {/* Update Button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleUpdate}
          isLoading={updateTripMutation.isPending}
          fullWidth
          style={styles.updateButton}
        >
          Update Trip
        </Button>
      </ScrollView>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartPicker(Platform.OS === 'ios');
            if (selectedDate) {
              setStartDate(selectedDate);
              // Auto-adjust end date if it's before new start date
              if (endDate <= selectedDate) {
                setEndDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
              }
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={startDate}
          onChange={(event, selectedDate) => {
            setShowEndPicker(Platform.OS === 'ios');
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    fontSize: 20,
  },
  content: {
    padding: spacing.pagePaddingMobile,
    paddingBottom: spacing[8],
  },
  field: {
    marginBottom: spacing[5],
  },
  label: {
    marginBottom: spacing[2],
    color: colors.neutral[700],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    marginTop: spacing[4],
  },
});
