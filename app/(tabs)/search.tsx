import { useMemo, useState } from 'react';
import { FlatList, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { ProductCard } from '@/components/product/productCard';
import { ProductCardSkeleton } from '@/components/product/productCardSkeleton';
import { Icon } from '@/icons/lucideIcon';
import { useInventory } from '@/hooks/products/useInventory';
import { useUpcomingProducts } from '@/hooks/products/useUpcomingProducts';
import { colors } from '@/lib/theme/colors';
import type { Product } from '@/types/product';

function normalize(text: string, fuzzy = false): string {
  let t = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/k/g, 'c')
    .replace(/q/g, 'c')
    .replace(/v/g, 'b')
    .replace(/z/g, 's')
    .replace(/ll/g, 'y')
    .replace(/y/g, 'i')
    .replace(/rr/g, 'r');
  if (fuzzy) t = t.replace(/h/g, '');
  return t.replace(/[^a-z0-9\s]/g, '').trim();
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

function score(query: string, product: Product) {
  const qWords = normalize(query).split(/\s+/).filter(Boolean);
  if (qWords.length === 0) return { total: 0, percentage: 0 };
  const pExact = normalize([product.name, product.brand, product.categoria?.name ?? ''].join(' '));
  const pFuzzy = normalize([product.name, product.brand, product.categoria?.name ?? ''].join(' '), true);
  const pExactWords = pExact.split(/\s+/).filter(Boolean);
  const pFuzzyWords = pFuzzy.split(/\s+/).filter(Boolean);

  let exactMatches = 0;
  let partialMatches = 0;
  let fuzzyMatches = 0;
  const used = new Set<number>();

  for (const q of qWords) {
    const idx = pExactWords.findIndex((w, i) => w === q && !used.has(i));
    if (idx >= 0) {
      exactMatches++;
      used.add(idx);
    }
  }

  for (const q of qWords) {
    if (q.length < 2) continue;
    const partialIndex = pExactWords.findIndex(
      (word, index) => !used.has(index) && (word.startsWith(q) || q.startsWith(word)),
    );
    if (partialIndex >= 0) {
      partialMatches++;
      used.add(partialIndex);
      continue;
    }

    for (let i = 0; i < pFuzzyWords.length; i++) {
      if (used.has(i)) continue;
      const maxLen = Math.max(q.length, pFuzzyWords[i].length);
      if (levenshtein(q, pFuzzyWords[i]) <= Math.max(1, Math.floor(maxLen / 3))) {
        fuzzyMatches++;
        used.add(i);
        break;
      }
    }
  }

  const matchedWords = exactMatches + partialMatches + fuzzyMatches;
  return {
    // Los matches exactos pesan más para ordenar, sin perder los difusos.
    total: exactMatches * 3 + partialMatches * 2 + fuzzyMatches,
    percentage: (matchedWords / qWords.length) * 100,
  };
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
    if (!query.trim()) return allProducts;
    return allProducts
      .map((product, index) => ({ product, index, ...score(query, product) }))
      .sort(
        (a, b) =>
          b.percentage - a.percentage ||
          b.total - a.total ||
          a.index - b.index,
      )
      .map(({ product }) => product);
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
        
        />
      )}

    </View>
  );
}