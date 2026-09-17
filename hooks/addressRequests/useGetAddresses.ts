import { useQuery } from '@tanstack/react-query';
import { fetchAddresses } from '@/data/services/address.service';
import { useAuthStore } from '@/store/authStore';

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