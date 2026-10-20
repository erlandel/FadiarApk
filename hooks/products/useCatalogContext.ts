import { useQuery } from '@tanstack/react-query';
import { fetchCatalogContext } from '@/data/services/catalog.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';

export function useCatalogContext(options: { enabled?: boolean } = {}) {
  const provinceId = useProductsByLocationStore((state) => state.provinceId);
  return useQuery({
    queryKey: ['catalog-context', provinceId],
    queryFn: () => fetchCatalogContext(provinceId),
    enabled: Boolean(provinceId) && options.enabled !== false,
    staleTime: 30 * 60 * 1000,
  });
}
