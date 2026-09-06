import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { recoverCredentialsByEmail } from '../../data/services/auth.service';
import { toastError, toastSuccess } from '@/messages/toast';

export function useRecoverPassword() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (email: string) => recoverCredentialsByEmail(email),
    onSuccess: () => {
      toastSuccess('Se ha enviado un correo con su nueva contraseña.');
      router.push('/(auth)/login');
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error || err?.message || 'Usuario no encontrado. Verifica tu correo electrónico.';
      toastError(message);
    },
  });

  return {
    recover: mutation.mutate,
    isLoading: mutation.isPending,
  };
}