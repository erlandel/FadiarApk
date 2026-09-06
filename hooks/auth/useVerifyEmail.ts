import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { verifyCodeEmail } from '../../data/services/auth.service';
import { asyncStorage } from '@/lib/storage/storage';
import { useAuthStore } from '@/store/authStore';
import { toastError, toastSuccess } from '@/messages/toast';

export function useVerifyEmail() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const mutation = useMutation({
    mutationFn: ({ code, email }: { code: string; email: string }) =>
      verifyCodeEmail(code, email),
    onSuccess: (payload) => {
      if (payload) setAuth(payload);
      void asyncStorage.remove('verificationEmail');
      toastSuccess('Cuenta verificada correctamente');
      router.replace('/(tabs)');
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Error al verificar el código';
      toastError(message);
    },
  });

  return {
    verify: mutation.mutate,
    isLoading: mutation.isPending,
  };
}