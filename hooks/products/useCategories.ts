import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/data/services/catalog.service';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';
import type { ProductCategory } from '@/types/product';

export const flattenCategories = (
  categories: ProductCategory[]
): { id: string; label: string }[] =>
  categories.flatMap((category) => [
    { id: category.id, label: category.name },
    ...flattenCategories(category.hijos ?? []),
  ]);

export const expandCategoryIds = (categories: ProductCategory[], selectedIds: string[]) => {
  const selected = new Set(selectedIds);
  const expanded = new Set<string>();
  const visit = (category: ProductCategory, inherited: boolean) => {
    const include = inherited || selected.has(category.id);
    if (include) expanded.add(category.id);
    category.hijos?.forEach((child) => visit(child, include));
  };
  categories.forEach((category) => visit(category, false));
  return [...expanded];
};

export function useCategories(options: { enabled?: boolean } = {}) {
  const provinceId = useProductsByLocationStore((state) => state.provinceId);
  return useQuery({
    queryKey: ['product-categories-tree', provinceId],
    queryFn: fetchCategories,
    staleTime: Infinity,
    enabled: Boolean(provinceId) && options.enabled !== false,
  });
}
