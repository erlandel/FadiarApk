import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAddress } from '@/data/services/address.service';
import { useAuthStore } from '@/store/authStore';
import { toastError, toastSuccess } from '@/messages/toast';

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.auth?.user?.id);

  const mutation = useMutation({
    mutationFn: (addressId: string) => deleteAddress(addressId),
    onSuccess: () => {
      toastSuccess('Dirección eliminada correctamente');
      void queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
    onError: (err: any) => toastError(err?.response?.data?.error || 'Error al eliminar la dirección'),
  });

  return { deleteAddressMutation: mutation.mutate, isDeleting: mutation.isPending };
}