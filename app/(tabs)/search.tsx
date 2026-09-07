import { useMemo, useState } from 'react';
import { FlatList, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { ProductCard } from '@/components/product/productCard';
import { ProductCardSkeleton } from '@/components/product/productCardSkeleton';
import { Icon } from '@/icons/lucideIcon';
import { useInventory } from '@/hooks/products/useInventory';
import { useUpcomingProducts } from '@/hooks/products/useUpcomingProducts';
import { colors } from '@/lib/theme/colors';
import type { Product } from '@/types/product';

function normalizeExact(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/k/g, 'c')
    .replace(/q/g, 'c')
    .replace(/v/g, 'b')
    .replace(/z/g, 's')
    .replace(/ll/g, 'y')
    .replace(/y/g, 'i')
    .replace(/rr/g, 'r')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function normalizeFuzzy(text: string): string {
  return normalizeExact(text).replace(/h/g, '');
}

function levenshtein(a: string, b: string): number {
  const n = a.length;
  const m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  let prev = Array.from({ length: m + 1 }, (_, j) => j);
  let curr = new Array<number>(m + 1);
  for (let i = 1; i <= n; i++) {
    curr[0] = i;
    const ai = a.charCodeAt(i - 1);
    for (let j = 1; j <= m; j++) {
      const cost = ai === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[m];
}

function calculateScore(query: string, product: Product) {
  const qWords = normalizeExact(query).split(/\s+/).filter(Boolean);
  if (qWords.length === 0) {
    return { exactMatches: 0, fuzzyMatches: 0, total: 0, percentage: 0 };
  }

  const productText = [product.name, product.brand, product.categoria?.name ?? ''].join(' ');
  const pWordsExact = normalizeExact(productText).split(/\s+/).filter(Boolean);
  const pWordsFuzzy = normalizeFuzzy(productText).split(/\s+/).filter(Boolean);

  let exactMatches = 0;
  let containedMatches = 0;
  let fuzzyMatches = 0;
  const usedIndices = new Set<number>();

  for (const qWord of qWords) {
    for (let i = 0; i < pWordsExact.length; i++) {
      if (qWord === pWordsExact[i] && !usedIndices.has(i)) {
        exactMatches++;
        usedIndices.add(i);
        break;
      }
    }
  }

  for (const qWord of qWords) {
    if (qWord.length < 3) continue;
    for (let i = 0; i < pWordsExact.length; i++) {
      if (!usedIndices.has(i) && pWordsExact[i].includes(qWord)) {
        containedMatches++;
        usedIndices.add(i);
        break;
      }
    }
  }

  if (exactMatches < qWords.length) {
    for (const qWord of qWords) {
      for (let i = 0; i < pWordsFuzzy.length; i++) {
        if (usedIndices.has(i)) continue;

        const maxLen = Math.max(qWord.length, pWordsFuzzy[i].length);
        const threshold = Math.max(1, Math.floor(maxLen / 3));
        if (levenshtein(qWord, pWordsFuzzy[i]) <= threshold) {
          fuzzyMatches++;
          usedIndices.add(i);
          break;
        }
      }
    }
  }

  const total = exactMatches * 3 + containedMatches * 2 + fuzzyMatches;
  const percentage = ((exactMatches + containedMatches) / qWords.length) * 100;
  return { exactMatches, containedMatches, fuzzyMatches, total, percentage };
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { data: inventoryData, isLoading } = useInventory();
  const { data: upcomingProducts = [] } = useUpcomingProducts();

  const allProducts = useMemo<Product[]>(
    () => [...(inventoryData?.products ?? []), ...upcomingProducts.map((p) => ({ ...p, isPreSale: true }))],
    [inventoryData, upcomingProducts],
  );

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return allProducts;

    const scored = allProducts
      .map((product) => ({ product, ...calculateScore(trimmed, product) }))
      .filter((item) => item.total > 0);

    const exact100 = scored.filter((item) => item.percentage === 100);
    if (exact100.length > 0) return exact100.map((item) => item.product);

    if (scored.length > 0) {
      const maxTotal = Math.max(...scored.map((item) => item.total));
      return scored
        .filter((item) => item.total === maxTotal)
        .map((item) => item.product);
    }

    const queryChars = [...new Set(normalizeFuzzy(trimmed).replace(/\s/g, '').split(''))];
    if (queryChars.length === 0) return [];

    const charScored = allProducts
      .map((product) => {
        const productText = normalizeFuzzy(
          [product.name, product.brand, product.categoria?.name ?? ''].join(' '),
        );
        const matches = queryChars.filter((character) => productText.includes(character)).length;
        return { product, matches };
      })
      .filter((item) => item.matches > 0);

    if (charScored.length === 0) return [];
    const maxCharMatches = Math.max(...charScored.map((item) => item.matches));
    return charScored
      .filter((item) => item.matches === maxCharMatches)
      .map((item) => item.product);
  }, [query, allProducts]);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center gap-5 bg-primary px-4 py-3">
        <View
          className={`h-12 flex-1 flex-row items-center rounded-2xl bg-white/80
             px-4 ${
            isFocused ? 'border border-primary' : ''
          }`}
        >
          <Icon name="Search" size={22} color={colors.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar productos..."
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            returnKeyType="search"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="ml-2 flex-1 py-0 text-[15px] text-text"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Limpiar búsqueda">
              <Icon name="X" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <FlatList
          numColumns={2}
          data={[0, 1, 2, 3]}
          keyboardShouldPersistTaps="handled"
          onTouchStart={Keyboard.dismiss}
          keyExtractor={(i) => `s-${i}`}
          renderItem={() => (
            <View className="flex-1 px-2 py-2">
              <ProductCardSkeleton />
            </View>
          )}
          contentContainerClassName="px-2 py-2"
        />
      ) : (
        <FlatList
          numColumns={2}
          data={results}
          keyboardShouldPersistTaps="handled"
          onTouchStart={Keyboard.dismiss}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
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
                isPreSale={item.isPreSale}
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-base text-muted">
                {query.trim()
                  ? `No se encontraron productos para "${query}"`
                  : 'No hay productos disponibles'}
              </Text>
            </View>
          }
          contentContainerClassName="px-2 py-2"
        />
      )}
    </View>
  );
}