import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { ProductCard } from '@/components/product/productCard';
import { ProductCardSkeleton } from '@/components/product/productCardSkeleton';
import { StoreSelector } from '@/components/product/storeSelector';
import { ProductFilters } from '@/components/product/productFilters';
import { Icon } from '@/icons/lucideIcon';
import { useInventory } from '@/hooks/products/useInventory';
import { useFiltersStore } from '@/store/filtersStore';
import { normalizeText } from '@/utils/format';
import { colors } from '@/lib/theme/colors';
import type { Store } from '@/types/product';

export default function ProductsScreen() {
  const { data: inventory, isLoading } = useInventory();
  const { selectedCategories, toggleCategory, isFilterOpen, setIsFilterOpen } = useFiltersStore();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);

  const allProducts = inventory?.products ?? [];
  const tiendas: Store[] = inventory?.tiendas ?? [];

  const storeOptions = useMemo(
    () => [{ id: 'all', name: 'Todas' }, ...tiendas.map((t) => ({ id: t.id, name: t.name }))],
    [tiendas],
  );

  const availableCategories = useMemo(() => {
    const map = new Map<string, string>();
    allProducts.forEach((p) => {
      const name = p.categoria?.name;
      if (name) {
        const key = normalizeText(name);
        if (!map.has(key)) map.set(key, name);
      }
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    if (selectedStoreId !== 'all') {
      filtered = filtered.filter((p) => p.tiendaId === selectedStoreId);
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => {
        const cat = p.categoria?.name ? normalizeText(p.categoria.name) : '';
        return selectedCategories.some((c) => normalizeText(c) === cat);
      });
    }
    return [...filtered].reverse();
  }, [allProducts, selectedStoreId, selectedCategories]);

  return (
    <View className="flex-1 bg-white">
      {isStoreSelectorOpen ? (
        <Pressable
          accessibilityLabel="Cerrar selector de tiendas"
          onPress={() => setIsStoreSelectorOpen(false)}
          className="absolute inset-0 z-10"
        />
      ) : null}
      <View className="flex-row items-center gap-5  bg-primary px-2 py-2  ">
        {tiendas.length > 0 ? (
          <StoreSelector
            options={storeOptions}
            selectedId={selectedStoreId}
            onChange={setSelectedStoreId}
            open={isStoreSelectorOpen}
            onOpenChange={setIsStoreSelectorOpen}
          />
        ) : (
          <View className="flex-1" />
        )}

        <Pressable
          onPress={() => setIsFilterOpen(true)}
          className="relative  flex-row items-center gap-1.5 rounded-xl bg-accent px-4 py-3 active:opacity-90"
        >
          <Icon name="Funnel" size={18} color={colors.primary} />
          <Text className="text-sm font-bold text-primary">Filtros</Text>

          {selectedCategories.length > 0 ? (
            <View className="ml-1 h-5 w-5 items-center justify-center rounded-full bg-primary">
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
              className="flex-row items-center gap-1 rounded-full bg-surface px-3 py-1.5"
            >
              <Text className="text-sm text-primary">{cat}</Text>
              <Icon name="X" size={14} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {isLoading ? (
        <FlatList
          numColumns={2}
          data={Array.from({ length: 6 })}
          keyExtractor={(_, i) => `s-${i}`}
          renderItem={() => (
            <View className="flex-1 px-2 py-2">
              <ProductCardSkeleton />
            </View>
          )}
          contentContainerClassName="p-2"
        />
      ) : (
        <FlatList
          numColumns={2}
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
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
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-base text-muted">No se encontraron productos</Text>
            </View>
          }
          contentContainerClassName="p-2"
        />
      )}

      <ProductFilters
        categories={availableCategories}
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </View>
  );
}