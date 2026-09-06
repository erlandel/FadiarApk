import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCartQuantity } from '../../data/services/cart.service';
import { toastError } from '@/messages/toast';

export function useUpdateCart() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ cartId, newCount }: { cartId: string | number; newCount: number }) =>
      updateCartQuantity(cartId, newCount),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => toastError('No se pudo actualizar la cantidad'),
  });

  return {
    updateQuantity: mutation.mutate,
    loading: mutation.isPending,
  };
}