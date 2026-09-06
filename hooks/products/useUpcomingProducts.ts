import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingProducts } from '../../data/services/inventory.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';
import type { Product } from '@/types/product';

export function useUpcomingProducts() {
  const provinceId = useProductsByLocationStore((s) => s.provinceId);

  return useQuery({
    queryKey: ['upcoming-products', provinceId],
    queryFn: () => fetchUpcomingProducts(provinceId) as Promise<Product[]>,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}