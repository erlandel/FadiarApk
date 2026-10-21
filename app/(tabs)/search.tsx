import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ProductCard } from '@/components/product/productCard';
import { ProductCardSkeleton } from '@/components/product/productCardSkeleton';
import { Icon } from '@/icons/lucideIcon';
import { colors } from '@/lib/theme/colors';
import { useSearchProducts } from '@/hooks/products/useSearchProducts';
import { useProductsByLocationStore } from '@/store/productsByLocationStore';
import type { Product } from '@/types/product';
import { FloatingActions } from '@/components/floatingActions/floatingActions';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const SKELETON_ITEMS = [0, 1, 2, 3];
const productKey = (item: Product) => item.id;
const skeletonKey = (item: number) => `s-${item}`;
const renderSkeleton = () => (
  <View className="flex-1 px-2 py-2">
    <ProductCardSkeleton />
  </View>
);
const renderProduct = ({ item }: ListRenderItemInfo<Product>) => (
  <View className="flex-1 px-1 py-2">
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
      isPreSale={item.pre_venta}
    />
  </View>
);

export default function SearchScreen() {
  const listRef = useRef<FlatList<Product>>(null);
  const scroll = useScrollToTop();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const hasScrolledResults = useRef(false);
  const provinceId = useProductsByLocationStore((state) => state.provinceId);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const search = useSearchProducts(debouncedQuery);

  useEffect(() => {
    hasScrolledResults.current = false;
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timeout);
  }, [query]);

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timeout);
    }, [])
  );

  const results = useMemo(() => {
    const seen = new Set<string>();
    return (
      search.data?.pages
        .flatMap((page) => page.products)
        .filter((product) => {
          if (seen.has(product.id)) return false;
          seen.add(product.id);
          return true;
        }) ?? []
    );
  }, [search.data]);

  const isTooShort = query.trim().length > 0 && query.trim().length < 2;
  const isLoading = search.isLoading && !results.length;

  return (
    <View className="flex-1 bg-white">
      <View className="bg-primary flex-row items-center gap-5 px-4 py-3">
        <View className="h-12 flex-1 flex-row items-center rounded-2xl bg-white/80 px-4">
          <Icon name="Search" size={22} color={colors.primary} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar productos..."
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            returnKeyType="search"
            className="ml-2 flex-1 py-0 text-[15px]"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Icon name="X" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>
      {isLoading ? (
        <FlatList
          numColumns={2}
          data={SKELETON_ITEMS}
          keyExtractor={skeletonKey}
          renderItem={renderSkeleton}
          contentContainerClassName="px-2 py-2"
        />
      ) : (
        <FlatList
          numColumns={2}
          data={results}
          contentContainerStyle={{ paddingBottom: 144 }}
          ref={listRef}
          keyboardShouldPersistTaps="handled"
          onTouchStart={Keyboard.dismiss}
          keyExtractor={productKey}
          renderItem={renderProduct}
          onEndReached={() => {
            if (hasScrolledResults.current && search.hasNextPage && !search.isFetchingNextPage)
              void search.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          onScroll={(event) => {
            scroll.onScroll(event);
            if (event.nativeEvent.contentOffset.y > 80) hasScrolledResults.current = true;
          }}
          scrollEventThrottle={100}
          ListFooterComponent={
            search.isFetchingNextPage ? (
              <Text className="text-muted py-4 text-center">Cargando más...</Text>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-muted text-base">
                {!provinceId
                  ? 'Selecciona una ubicación para buscar'
                  : isTooShort
                    ? 'Escribe al menos 2 caracteres'
                    : search.isError
                      ? 'No se pudo realizar la búsqueda'
                      : query.trim()
                        ? `No se encontraron productos para "${query}"`
                        : 'Busca productos por nombre, marca o categoría'}
              </Text>
            </View>
          }
          contentContainerClassName="px-2 py-2"
        />
      )}
      <FloatingActions
        showBackToTop={scroll.showBackToTop && !isLoading}
        onBackToTop={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
      />
    </View>
  );
}
