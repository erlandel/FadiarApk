import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editAddress } from '@/data/services/address.service';
import { useAuthStore } from '@/store/authStore';
import { toastError, toastSuccess } from '@/messages/toast';

export function useEditAddress() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.auth?.user?.id);

  const mutation = useMutation({
    mutationFn: (params: { id_direccion: string; municipio: string; direccion: string }) =>
      editAddress(params),
    onSuccess: () => {
      toastSuccess('Dirección editada correctamente');
      void queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
    onError: (err: any) => toastError(err?.response?.data?.error || 'Error al editar la dirección'),
  });

  return { editAddressMutation: mutation.mutate, isPending: mutation.isPending };
}