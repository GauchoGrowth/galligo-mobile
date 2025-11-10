/**
 * Component Test Screen
 *
 * Proof-of-concept screen showcasing Button, Card, and Text components
 * Tests design system integration and iOS Simulator MCP validation
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text, H1, H2, H3, Body, Caption } from '@/components/ui';
import { theme } from '@/theme';

const { colors, spacing } = theme;

export const ComponentTestScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [pressCount, setPressCount] = useState(0);

  const handlePress = () => {
    setPressCount(prev => prev + 1);
  };

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.section}>
          <H1>GalliGo Components</H1>
          <Caption color={colors.neutral[600]}>Design System Proof of Concept</Caption>
        </View>

        {/* Typography Section */}
        <View style={styles.section}>
          <H2>Typography</H2>
          <View style={styles.gap}>
            <H3>Heading 3 Example</H3>
            <Body>This is body text. The design system includes a complete typography scale with proper line heights and letter spacing.</Body>
            <Caption>Caption text for metadata and helper information</Caption>
          </View>
        </View>

        {/* Button Variants Section */}
        <View style={styles.section}>
          <H2>Button Variants</H2>
          <View style={styles.gap}>
            <Button variant="primary" onPress={handlePress}>
              Primary Button
            </Button>

            <Button variant="secondary" onPress={handlePress}>
              Secondary Button
            </Button>

            <Button variant="ghost" onPress={handlePress}>
              Ghost Button
            </Button>

            <Button variant="destructive" onPress={handlePress}>
              Destructive Button
            </Button>
          </View>

          <Caption align="center" style={{ marginTop: spacing[2] }}>
            Press count: {pressCount}
          </Caption>
        </View>

        {/* Button Sizes Section */}
        <View style={styles.section}>
          <H2>Button Sizes</H2>
          <View style={styles.gap}>
            <Button variant="primary" size="sm" onPress={handlePress}>
              Small Button (44px)
            </Button>

            <Button variant="primary" size="md" onPress={handlePress}>
              Medium Button (48px)
            </Button>

            <Button variant="primary" size="lg" onPress={handlePress}>
              Large Button (56px)
            </Button>
          </View>
        </View>

        {/* Button States Section */}
        <View style={styles.section}>
          <H2>Button States</H2>
          <View style={styles.gap}>
            <Button variant="primary" disabled>
              Disabled Button
            </Button>

            <Button
              variant="primary"
              isLoading={loading}
              onPress={handleLoadingTest}
            >
              {loading ? 'Loading...' : 'Test Loading State'}
            </Button>

            <Button variant="primary" fullWidth onPress={handlePress}>
              Full Width Button
            </Button>
          </View>
        </View>

        {/* Card Variants Section */}
        <View style={styles.section}>
          <H2>Card Variants</H2>
          <View style={styles.gap}>
            <Card variant="default">
              <H3>Default Card</H3>
              <Body>This is a default card with subtle shadow and border.</Body>
            </Card>

            <Card variant="elevated">
              <H3>Elevated Card</H3>
              <Body>This card has more prominent shadow for depth.</Body>
            </Card>

            <Card variant="outline">
              <H3>Outline Card</H3>
              <Body>This card uses border instead of shadow.</Body>
            </Card>
          </View>
        </View>

        {/* Interactive Card Section */}
        <View style={styles.section}>
          <H2>Interactive Card</H2>
          <Card
            variant="elevated"
            pressable
            onPress={handlePress}
            accessibilityLabel="Pressable card example"
          >
            <H3>Tap Me!</H3>
            <Body>This card is pressable with iOS-style feedback animation.</Body>
            <Caption style={{ marginTop: spacing[2] }}>
              Pressed {pressCount} times
            </Caption>
          </Card>
        </View>

        {/* Design System Info */}
        <View style={styles.section}>
          <Card variant="outline" style={{ backgroundColor: colors.primary.blueLight }}>
            <H3>Design System Features</H3>
            <View style={{ marginTop: spacing[2] }}>
              <Body>✅ Complete color palette from web</Body>
              <Body>✅ 8pt grid spacing system</Body>
              <Body>✅ Typography scale with line heights</Body>
              <Body>✅ iOS-style shadows and elevations</Body>
              <Body>✅ Reanimated spring animations</Body>
              <Body>✅ 44-48px touch targets (iOS HIG)</Body>
              <Body>✅ Full TypeScript support</Body>
            </View>
          </Card>
        </View>

        {/* Spacer at bottom for safe area */}
        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: spacing.pagePaddingMobile,
    paddingTop: spacing[6],
  },

  section: {
    marginBottom: spacing[8], // 32px - aligned to 8pt grid
  },

  gap: {
    marginTop: spacing[4],
    gap: spacing[4], // 16px spacing between items
  },
});
