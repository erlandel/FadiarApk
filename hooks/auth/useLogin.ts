import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { login } from '../../data/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { toastError } from '@/messages/toast';

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (payload) => {
      setAuth(payload);
      void useCartStore.persist.rehydrate();
      router.replace('/(tabs)');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.error || err?.message || 'Error al iniciar sesión';
      if (message === 'Su cuenta no ha sido verificada') {
        router.push('/(auth)/verificationCodeEmail');
        return;
      }
      toastError(message);
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
  };
}