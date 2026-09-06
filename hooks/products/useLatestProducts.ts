import { useQuery } from '@tanstack/react-query';
import { fetchLatestProducts } from '../../data/services/products.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';
import type { Product } from '@/types/product';

export function useLatestProducts(count = 15) {
  const municipalityId = useProductsByLocationStore((s) => s.municipalityId);
  const provinceId = useProductsByLocationStore((s) => s.provinceId);

  return useQuery({
    queryKey: ['latest-products', municipalityId, count],
    queryFn: () => fetchLatestProducts(count, municipalityId, provinceId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}