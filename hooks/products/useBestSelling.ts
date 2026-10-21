import { useQuery } from '@tanstack/react-query';
import { fetchBestSelling } from '../../data/services/products.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';

export function useBestSelling(count = 15) {
  const municipalityId = useProductsByLocationStore((s) => s.municipalityId);
  const provinceId = useProductsByLocationStore((s) => s.provinceId);

  return useQuery({
    queryKey: ['best-selling', municipalityId, count],
    queryFn: () => fetchBestSelling(count, municipalityId, provinceId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
