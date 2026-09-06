import { useMutation } from '@tanstack/react-query';
import { resendVerificationEmail } from '../../data/services/auth.service';
import { toastSuccess } from '@/messages/toast';

export function useResendCode() {
  const mutation = useMutation({
    mutationFn: (email: string) => resendVerificationEmail(email),
    onSuccess: () => toastSuccess('Código reenviado correctamente'),
  });

  return {
    resend: mutation.mutate,
    isLoading: mutation.isPending,
  };
}