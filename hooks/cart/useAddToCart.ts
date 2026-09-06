import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { addProductToCart, syncCart } from '../../data/services/cart.service';
import { useAuthStore } from '@/store/authStore';
import { toastError, toastSuccess } from '@/messages/toast';

export function useAddToCart() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (item: { productId: string; tiendaId?: string; quantity: number }) => {
      const auth = useAuthStore.getState().auth;
      if (!auth) throw new Error('NO_AUTH');
      return addProductToCart(item);
    },
    onSuccess: () => {
      void syncCart();
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      toastSuccess('Producto agregado al carrito');
    },
    onError: (err: any) => {
      if (err?.message === 'NO_AUTH') {
        router.push('/(auth)/login');
        return;
      }
      const message = err?.response?.data?.error || 'No se pudo agregar el producto al carrito';
      toastError(message);
    },
  });

  return {
    addToCart: mutation.mutate,
    loading: mutation.isPending,
  };
}