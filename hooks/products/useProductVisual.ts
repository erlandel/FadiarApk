import { useQuery } from '@tanstack/react-query';
import { fetchProductForVisual } from '@/data/services/products.service';

export function useProductVisual(id?: string) {
  return useQuery({
    queryKey: ['product-visual', id],
    queryFn: () => fetchProductForVisual(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}
