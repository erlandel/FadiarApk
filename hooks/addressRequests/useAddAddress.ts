import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addAddress } from '@/data/services/address.service';
import { useAuthStore } from '@/store/authStore';
import { toastError, toastSuccess } from '@/messages/toast';

export function useAddAddress() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.auth?.user?.id);

  const mutation = useMutation({
    mutationFn: ({ address, municipalityId }: { address: string; municipalityId: string }) =>
      addAddress(address, municipalityId),
    onSuccess: () => {
      toastSuccess('Dirección añadida correctamente');
      void queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
    onError: (err: any) => toastError(err?.response?.data?.error || 'Error al añadir la dirección'),
  });

  return { addAddressMutation: mutation.mutate, isPending: mutation.isPending };
}