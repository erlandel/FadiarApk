import { useQuery } from '@tanstack/react-query';
import { fetchRelatedProducts } from '@/data/services/catalog.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';

export function useRelatedProducts(
  categoryId?: string,
  productId?: string,
  storeId?: string,
  productName?: string
) {
  const provinceId = useProductsByLocationStore((state) => state.provinceId);
  return useQuery({
    queryKey: ['related-products', provinceId, categoryId, productId, storeId, productName],
    queryFn: () => fetchRelatedProducts(provinceId!, categoryId!, productId!, storeId, productName),
    enabled: Boolean(provinceId && categoryId && productId),
    staleTime: 30 * 60 * 1000,
  });
}
