import { useInfiniteQuery } from '@tanstack/react-query';
import { searchProducts } from '@/data/services/catalog.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';

export function useSearchProducts(text: string) {
  const provinceId = useProductsByLocationStore((state) => state.provinceId);
  const value = text.trim();
  return useInfiniteQuery({
    queryKey: ['search-products', provinceId, value],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => searchProducts(provinceId!, value, pageParam),
    getNextPageParam: (page) => page.nextCursor,
    enabled: Boolean(provinceId && value.length >= 2),
    staleTime: 5 * 60 * 1000,
  });
}
