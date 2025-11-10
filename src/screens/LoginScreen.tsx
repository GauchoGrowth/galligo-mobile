/**
 * Login Screen - GalliGo React Native
 *
 * Authentication screen with email/password login
 */

import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Input, H1, H2, Body, Caption } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { theme } from '@/theme';

const { colors, spacing } = theme;

export function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('dev@example.com'); // Pre-filled for testing
  const [password, setPassword] = useState('DevExample'); // Pre-filled for testing
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { error } = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        Alert.alert('Error', error.message);
      } else if (!isLogin) {
        Alert.alert('Success', 'Account created! Please log in.');
        setIsLogin(true);
      }
      // If login successful, AuthProvider will update and navigation will happen automatically
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <H1>GalliGo</H1>
            <Caption color={colors.neutral[600]}>
              Track your travels, discover new places
            </Caption>
          </View>

          {/* Login Card */}
          <Card variant="elevated" style={styles.card}>
            <H2>{isLogin ? 'Welcome back' : 'Create an account'}</H2>
            <Body color={colors.neutral[600]} style={{ marginTop: spacing[2] }}>
              {isLogin
                ? 'Enter your email to sign in to your account'
                : 'Enter your email to create your account'}
            </Body>

            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="m@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                autoComplete="password"
                editable={!loading}
              />

              <Button
                variant="primary"
                size="lg"
                onPress={handleSubmit}
                isLoading={loading}
                fullWidth
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </View>

            {/* Toggle between login/signup */}
            <View style={styles.toggleContainer}>
              <Caption color={colors.neutral[600]}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Caption>
              <Pressable onPress={() => setIsLogin(!isLogin)}>
                <Caption color={colors.primary.blue}>
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Caption>
              </Pressable>
            </View>
          </Card>

          {/* Test credentials hint */}
          <View style={styles.hint}>
            <Caption color={colors.neutral[500]} align="center">
              Test credentials:
            </Caption>
            <Caption color={colors.neutral[500]} align="center">
              dev@example.com / DevExample
            </Caption>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.pagePaddingMobile,
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },

  card: {
    padding: spacing[6],
  },

  form: {
    marginTop: spacing[6],
    gap: spacing[2],
  },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[4],
  },

  hint: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
});
