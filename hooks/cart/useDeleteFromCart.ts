import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProductFromCart } from '../../data/services/cart.service';
import { toastError, toastSuccess } from '@/messages/toast';

export function useDeleteFromCart() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (cartId: string | number) => deleteProductFromCart(cartId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      toastSuccess('Producto eliminado del carrito');
    },
    onError: () => toastError('No se pudo eliminar el producto del carrito'),
  });

  return {
    deleteFromCart: mutation.mutate,
    loading: mutation.isPending,
  };
}