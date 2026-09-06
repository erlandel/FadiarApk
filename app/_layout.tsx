import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/lib/providers/AppProviders';
import { initAuthTokens } from '@/lib/api/client';
import { useClockStore } from '@/store/clockStore';

import '../global.css';

export default function RootLayout() {
  const startClock = useClockStore((state) => state.startClock);

  useEffect(() => {
    void initAuthTokens();
    startClock();
  }, [startClock]);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(checkout)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen
          name="modal/location"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </AppProviders>
  );
}