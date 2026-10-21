import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../../data/services/orders.service';
import { useAuthStore } from '@/store/authStore';

export function useGetOrders(size = 10) {
  const userId = useAuthStore((s) => s.auth?.user?.id);
  const [currentPage, setCurrentPage] = useState(1);
  const offset = (currentPage - 1) * size;

  const query = useQuery({
    queryKey: ['orders', userId, offset, size],
    queryFn: () => fetchOrders('', offset, ''),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000,
  });

  const allOrders = query.data?.orders ?? [];
  const orders = allOrders.slice(offset, offset + size);

  return {
    orders,
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    currentPage,
    setCurrentPage,
    refetch: query.refetch,
  };
}
