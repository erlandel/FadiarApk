import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export function ProtectedScreen({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hasSession = Boolean(auth?.access_token && auth?.refresh_token);

  useEffect(() => {
    if (!isHydrated) return;
    if (!hasSession) {
      router.replace('/(auth)/login');
    }
  }, [hasSession, isHydrated, router]);

  if (!isHydrated || !hasSession) return null;

  return <>{children}</>;
}