import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export function ProtectedScreen({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuthStore((s) => s.auth);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;
    if (!auth) {
      router.replace('/(auth)/login');
    }
  }, [auth, isHydrated]);

  if (!isHydrated || !auth) return null;

  return <>{children}</>;
}