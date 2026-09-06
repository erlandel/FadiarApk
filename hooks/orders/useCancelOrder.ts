import { useMutation, useQueryClient } from '@tanstack/react-query';
import { denyOrder } from '../../data/services/orders.service';
import { toastSuccess } from '@/messages/toast';

export function useCancelOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (orderId: string) => denyOrder(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.setQueriesData({ queryKey: ['orders'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          orders: old.orders.map((order: any) =>
            order.id === orderId ? { ...order, status: 'Cancelado' } : order,
          ),
        };
      });
      toastSuccess('Orden cancelada correctamente');
    },
  });

  return {
    cancelOrder: mutation.mutate,
    isLoading: mutation.isPending,
    variables: mutation.variables,
  };
}