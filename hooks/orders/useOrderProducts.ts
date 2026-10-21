import { useQuery } from '@tanstack/react-query';
import { fetchOrderProducts } from '@/data/services/orders.service';
import { useAuthStore } from '@/store/authStore';

export function useOrderProducts(orderId: string, enabled: boolean) {
  const userId = useAuthStore((state) => state.auth?.user?.id);

  return useQuery({
    queryKey: ['order-products', userId, orderId],
    queryFn: () => fetchOrderProducts(orderId),
    enabled: Boolean(userId && orderId && enabled),
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
}
