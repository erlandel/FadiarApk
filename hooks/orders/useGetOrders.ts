import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../../data/services/orders.service';
import { useAuthStore } from '@/store/authStore';

export function useGetOrders(size = 10) {
  const userId = useAuthStore((s) => s.auth?.user?.id);
  const [currentPage, setCurrentPage] = useState(1);

  const query = useQuery({
    queryKey: ['orders', userId, size],
    queryFn: () => fetchOrders('', size, ''),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000,
  });

  return {
    orders: query.data?.orders ?? [],
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    currentPage,
    setCurrentPage,
    refetch: query.refetch,
  };
}