import { useSyncExternalStore } from 'react';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AppFrame } from '@/components/dashboard/AppFrame';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { NutriColors } from '@/constants/nutri';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}

function RootContent() {
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
  const { user, loading } = useAuth();

  return (
    <ThemeProvider value={DarkTheme}>
      <AnimatedSplashOverlay />
      {mounted && !loading ? (
        <AppFrame>
          {user ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: NutriColors.bg },
              }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="scan-options" />
              <Stack.Screen name="scan-recipe" />
              <Stack.Screen name="recipe/[id]" />
            </Stack>
          ) : (
            <AuthScreen />
          )}
        </AppFrame>
      ) : (
        <FallbackSurface />
      )}
    </ThemeProvider>
  );
}

function subscribeToNothing() {
  return () => {};
}

function FallbackSurface() {
  return <View style={{ flex: 1, backgroundColor: NutriColors.bg }} />;
}
