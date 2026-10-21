import { useQuery } from '@tanstack/react-query';
import { fetchOrderNote } from '@/data/services/orders.service';
import { useAuthStore } from '@/store/authStore';

export function useOrderNote(orderId: string, enabled: boolean) {
  const userId = useAuthStore((state) => state.auth?.user?.id);

  return useQuery({
    queryKey: ['order-note', userId, orderId],
    queryFn: () => fetchOrderNote(orderId),
    enabled: Boolean(userId && orderId && enabled),
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
}
