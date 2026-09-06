import { useQuery } from '@tanstack/react-query';
import { fetchInventory } from '../../data/services/inventory.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';
import type { InventoryData } from '@/types/product';

export function useInventory<T = InventoryData>(
  select?: (data: InventoryData) => T,
) {
  const provinceId = useProductsByLocationStore((s) => s.provinceId);

  return useQuery({
    queryKey: ['inventory', provinceId],
    queryFn: () => fetchInventory(provinceId),
    select,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}