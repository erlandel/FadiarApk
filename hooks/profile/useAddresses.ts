import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addAddress,
  deleteAddress,
  editAddress,
  fetchAddresses,
} from '../../data/services/address.service';
import { useAuthStore } from '@/store/authStore';
import { toastError, toastSuccess } from '@/messages/toast';

export function useGetAddresses() {
  const userId = useAuthStore((s) => s.auth?.user?.id);

  const query = useQuery({
    queryKey: ['addresses', userId],
    queryFn: fetchAddresses,
    enabled: !!userId,
    staleTime: 30 * 60 * 1000,
  });

  return {
    addresses: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

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

  return { addAddress: mutation.mutate, isPending: mutation.isPending };
}

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

  return { editAddress: mutation.mutate, isPending: mutation.isPending };
}

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

  return { deleteAddress: mutation.mutate, isPending: mutation.isPending };
}