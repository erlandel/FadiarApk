import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchStoreProducts } from '@/data/services/catalog.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';

export function useStoreProducts(
  params: Omit<Parameters<typeof fetchStoreProducts>[0], 'provinceId'> & { enabled?: boolean }
) {
  const provinceId = useProductsByLocationStore((state) => state.provinceId);
  const { enabled = true, ...filters } = params;
  return useInfiniteQuery({
    queryKey: ['store-products', provinceId, filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      fetchStoreProducts({ ...filters, provinceId: provinceId!, cursor: pageParam }),
    getNextPageParam: (page, pages) => {
      if (!page.nextCursor) return undefined;
      const repeatedCursor = pages
        .slice(0, -1)
        .some((previousPage) => previousPage.nextCursor === page.nextCursor);
      return repeatedCursor ? undefined : page.nextCursor;
    },
    enabled: Boolean(provinceId && filters.storeId) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
