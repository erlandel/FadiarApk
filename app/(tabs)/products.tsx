import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View, type ListRenderItemInfo } from 'react-native';
import { ProductCard } from '@/components/product/productCard';
import { ProductCardSkeleton } from '@/components/product/productCardSkeleton';
import { StoreSelector } from '@/components/product/storeSelector';
import { ProductFilters } from '@/components/product/productFilters';
import { Icon } from '@/icons/lucideIcon';
import { useCatalogContext } from '@/hooks/products/useCatalogContext';
import {
  expandCategoryIds,
  flattenCategories,
  useCategories,
} from '@/hooks/products/useCategories';
import { useBrands } from '@/hooks/products/useBrands';
import { useStoreProducts } from '@/hooks/products/useStoreProducts';
import { useFiltersStore } from '@/store/filtersStore';
import { normalizeText } from '@/utils/format';
import { colors } from '@/lib/theme/colors';
import type { Product, Store } from '@/types/product';
import { usePathname } from 'expo-router';

const SKELETON_ITEMS = [0, 1, 2, 3, 4, 5];
const productKey = (item: Product) => item.id;
const skeletonKey = (item: number) => `s-${item}`;
const renderSkeleton = () => (
  <View className="flex-1 px-2 py-2">
    <ProductCardSkeleton />
  </View>
);
const renderProduct = ({ item }: ListRenderItemInfo<Product>) => (
  <View className="flex-1 px-2 py-2">
    <ProductCard
      productId={item.id}
      title={item.name}
      brand={item.brand}
      category={item.categoria?.name}
      warranty={item.warranty}
      price={item.price}
      temporalPrice={item.temporal_price}
      image={item.img}
      count={item.count}
      currency={item.currency?.currency}
      tiendaId={item.tiendaId}
    />
  </View>
);

export default function ProductsScreen() {
  const pathname = usePathname();
  const isFocused = pathname === '/products' || pathname === '/(tabs)/products';
  const { data: catalog, isLoading: contextLoading } = useCatalogContext({ enabled: isFocused });
  const { data: categoryTree = [] } = useCategories({ enabled: isFocused });
  const { data: brands = [] } = useBrands();
  const selectedCategories = useFiltersStore((state) => state.selectedCategories);
  const toggleCategory = useFiltersStore((state) => state.toggleCategory);
  const selectedBrands = useFiltersStore((state) => state.selectedBrands);
  const selectedPrice = useFiltersStore((state) => state.selectedPrice);
  const isFilterOpen = useFiltersStore((state) => state.isFilterOpen);
  const setIsFilterOpen = useFiltersStore((state) => state.setIsFilterOpen);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);
  const hasScrolledProducts = useRef(false);

  const tiendas = useMemo<Store[]>(() => catalog?.tiendas ?? [], [catalog?.tiendas]);

  const storeOptions = useMemo(() => tiendas.map((t) => ({ id: t.id, name: t.name })), [tiendas]);

  const availableCategories = useMemo(
    () => flattenCategories(categoryTree).map((item) => ({ key: item.id, label: item.label })),
    [categoryTree]
  );

  const effectiveStoreId =
    selectedStoreId && tiendas.some((store) => store.id === selectedStoreId)
      ? selectedStoreId
      : (tiendas[0]?.id ?? '');

  const selectedCategoryIds = useMemo(
    () =>
      selectedCategories
        .map(
          (label) =>
            availableCategories.find((item) => normalizeText(item.label) === normalizeText(label))
              ?.key
        )
        .filter((id): id is string => Boolean(id)),
    [availableCategories, selectedCategories]
  );
  const categoryIds = useMemo(
    () => expandCategoryIds(categoryTree, selectedCategoryIds),
    [categoryTree, selectedCategoryIds]
  );
  const categoryResolutionPending = selectedCategories.length > 0 && categoryTree.length === 0;
  useEffect(() => {
    hasScrolledProducts.current = false;
  }, [effectiveStoreId, categoryIds, selectedBrands, selectedPrice]);
  const productsQuery = useStoreProducts({
    storeId: effectiveStoreId,
    categoryIds,
    brands: selectedBrands,
    price: selectedPrice ?? undefined,
    maxPrice: catalog?.maxPrice,
    enabled: isFocused && !categoryResolutionPending,
  });
  const allProducts = useMemo(() => {
    const seen = new Set<string>();
    return (
      productsQuery.data?.pages
        .flatMap((page) => page.products)
        .filter((product) => {
          const key = `${product.tiendaId}-${product.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }) ?? []
    );
  }, [productsQuery.data]);

  return (
    <View className="flex-1 bg-white">
      {isStoreSelectorOpen ? (
        <Pressable
          accessibilityLabel="Cerrar selector de tiendas"
          onPress={() => setIsStoreSelectorOpen(false)}
          className="absolute inset-0 z-10"
        />
      ) : null}
      <View className="bg-primary flex-row items-center justify-between px-4 py-2">
        {tiendas.length > 0 ? (
          <StoreSelector
            options={storeOptions}
            selectedId={effectiveStoreId}
            onChange={setSelectedStoreId}
            open={isStoreSelectorOpen}
            onOpenChange={setIsStoreSelectorOpen}
          />
        ) : (
          <View className="flex-1" />
        )}

        <Pressable
          onPress={() => setIsFilterOpen(true)}
          className="bg-accent relative h-11 flex-row items-center gap-1.5 rounded-xl px-4 active:opacity-90">
          <Icon name="Funnel" size={18} color={colors.primary} />
          <Text className="text-primary text-sm font-bold">Filtros</Text>

          {selectedCategories.length > 0 ? (
            <View className="bg-primary ml-1 h-5 w-5 items-center justify-center rounded-full">
              <Text className="text-xs font-bold text-white">{selectedCategories.length}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {selectedCategories.length > 0 ? (
        <View className="flex-row flex-wrap gap-2 px-4 py-2">
          {selectedCategories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => toggleCategory(cat)}
              className="bg-surface flex-row items-center gap-1 rounded-full px-3 py-1.5">
              <Text className="text-primary text-sm">{cat}</Text>
              <Icon name="X" size={14} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {contextLoading || productsQuery.isLoading ? (
        <FlatList
          numColumns={2}
          data={SKELETON_ITEMS}
          keyExtractor={skeletonKey}
          renderItem={renderSkeleton}
          contentContainerClassName="p-2"
        />
      ) : (
        <FlatList
          numColumns={2}
          data={allProducts}
          keyExtractor={productKey}
          renderItem={renderProduct}
          onEndReached={() => {
            if (
              hasScrolledProducts.current &&
              productsQuery.hasNextPage &&
              !productsQuery.isFetchingNextPage &&
              !productsQuery.isError
            )
              void productsQuery.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          onScroll={(event) => {
            if (event.nativeEvent.contentOffset.y > 80) hasScrolledProducts.current = true;
          }}
          scrollEventThrottle={100}
          ListFooterComponent={
            productsQuery.isFetchingNextPage ? (
              <View className="flex-row px-2">
                {[0, 1].map((index) => (
                  <View key={`page-skeleton-${index}`} className="flex-1 px-2 py-2">
                    <ProductCardSkeleton />
                  </View>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-muted text-base">No se encontraron productos</Text>
            </View>
          }
          contentContainerClassName="p-2"
        />
      )}

      <ProductFilters
        categories={availableCategories}
        brands={brands}
        maxPrice={catalog?.maxPrice ?? 0}
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </View>
  );
}
