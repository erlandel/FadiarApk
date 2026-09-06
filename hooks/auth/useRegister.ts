import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { register } from '../../data/services/auth.service';
import { asyncStorage } from '@/lib/storage/storage';
import { toastError } from '@/messages/toast';

export function useRegister() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (payload: {
      name: string;
      lastname1: string;
      lastname2: string;
      email: string;
      password: string;
      type: string;
    }) => register(payload),
    onSuccess: (_data, variables) => {
      void asyncStorage.setString('verificationEmail', variables.email);
      router.push('/(auth)/verificationCodeEmail');
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error || err?.response?.data?.message || 'Error en el registro';
      toastError(message);
    },
  });

  return {
    register: mutation.mutate,
    isLoading: mutation.isPending,
  };
}