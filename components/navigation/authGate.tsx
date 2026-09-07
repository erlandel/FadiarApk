import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const auth = useAuthStore((s) => s.auth);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hasSession = Boolean(auth?.access_token && auth?.refresh_token);

  useEffect(() => {
    if (!isHydrated) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (hasSession && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [hasSession, segments, isHydrated, router]);

  return null;
}
