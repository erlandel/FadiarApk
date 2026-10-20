import { useQuery } from '@tanstack/react-query';
import { fetchBrands } from '@/data/services/catalog.service';
export function useBrands() {
  return useQuery({ queryKey: ['product-brands'], queryFn: fetchBrands, staleTime: Infinity });
}
