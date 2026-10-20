import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedProducts } from '@/data/services/catalog.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';

export function useFeaturedProducts(options: { enabled?: boolean } = {}) {
  const provinceId = useProductsByLocationStore((state) => state.provinceId);
  return useQuery({
    queryKey: ['featured-products-by-zone', provinceId],
    queryFn: () => fetchFeaturedProducts(provinceId!),
    enabled: Boolean(provinceId) && options.enabled !== false,
    staleTime: 30 * 60 * 1000,
  });
}
