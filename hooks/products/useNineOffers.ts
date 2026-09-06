import { useInventory } from './useInventory';
import type { Product } from '@/types/product';

export function useNineOffers(count = 9) {
  return useInventory<Product[]>((data) => {
    const products = data?.products ?? [];
    const hasValidOffer = (item: Product) => !!item.temporal_price;
    return products
      .filter(hasValidOffer)
      .sort((a, b) => Number(a.id) - Number(b.id))
      .slice(0, count);
  });
}