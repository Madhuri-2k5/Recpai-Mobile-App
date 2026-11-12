import { useSyncExternalStore } from 'react';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppFrame } from '@/components/dashboard/AppFrame';
import { NutriColors } from '@/constants/nutri';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );

  return (
    <ThemeProvider value={DarkTheme}>
      <AnimatedSplashOverlay />
      {mounted ? (
        <AppFrame>
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
