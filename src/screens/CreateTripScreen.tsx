/**
 * Create Trip Screen - GalliGo React Native
 *
 * Modal screen to create a new trip
 */

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { H1, Body, Input, Button } from '@/components/ui';
import { useCreateTrip } from '@/lib/api-hooks';
import { theme } from '@/theme';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const { colors, spacing, borderRadius } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTrip'>;

export function CreateTripScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now
  const [description, setDescription] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const createTripMutation = useCreateTrip();

  const handleCreate = async () => {
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
      await createTripMutation.mutateAsync({
        name: name.trim(),
        city: city.trim(),
        country: country.trim(),
        startDate,
        endDate,
        description: description.trim() || undefined,
        collaborators: [],
      });

      Alert.alert('Success', 'Trip created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip. Please try again.');
      console.error('Create trip error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={28} color={colors.neutral[900]} />
        </Pressable>
        <H1 style={styles.title}>Create Trip</H1>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Name */}
        <View style={styles.field}>
          <Body weight="medium" style={styles.label}>
            Trip Name *
          </Body>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Summer in Europe"
          />
        </View>

        {/* Destination */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Body weight="medium" style={styles.label}>
              City *
            </Body>
            <Input
              value={city}
              onChangeText={setCity}
              placeholder="Paris"
            />
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Body weight="medium" style={styles.label}>
              Country *
            </Body>
            <Input
              value={country}
              onChangeText={setCountry}
              placeholder="France"
            />
          </View>
        </View>

        {/* Dates */}
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Body weight="medium" style={styles.label}>
              Start Date *
            </Body>
            <Pressable
              onPress={() => setShowStartPicker(true)}
              style={styles.dateButton}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.neutral[600]} />
              <Body color={colors.neutral[900]}>
                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Body>
            </Pressable>
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Body weight="medium" style={styles.label}>
              End Date *
            </Body>
            <Pressable
              onPress={() => setShowEndPicker(true)}
              style={styles.dateButton}
            >
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

        {/* Create Button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleCreate}
          isLoading={createTripMutation.isPending}
          fullWidth
          style={styles.createButton}
        >
          Create Trip
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
  createButton: {
    marginTop: spacing[4],
  },
});
