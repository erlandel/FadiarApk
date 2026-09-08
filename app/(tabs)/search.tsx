import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProductCard } from '@/components/product/productCard';
import { ProductCardSkeleton } from '@/components/product/productCardSkeleton';
import { Icon } from '@/icons/lucideIcon';
import { useInventory } from '@/hooks/products/useInventory';
import { useUpcomingProducts } from '@/hooks/products/useUpcomingProducts';
import { colors } from '@/lib/theme/colors';
import type { Product } from '@/types/product';

/**
 * Normaliza texto quitando acentos, mayúsculas y signos, SIN colapso
 * fonético. Se usa para matches exactos (ej: "casa" no debe confundirse
 * con "caza" en el paso exacto).
 */
function normalizeExact(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Colapsa sonidos que se confunden al escribir en español (b/v, s/z,
 * ll/y/i, k/q/c, h muda, rr/r) en un solo pase secuencial y
 * determinista, evitando que una sustitución contamine el resultado
 * de la siguiente (ej: "ll" -> "y" -> "i" encadenado sin control).
 */
function phoneticCollapse(text: string): string {
  return text
    .replace(/ll/g, 'y')
    .replace(/rr/g, 'r')
    .replace(/qu/g, 'c')
    .replace(/[kq]/g, 'c')
    .replace(/[vb]/g, 'b')
    .replace(/[sz]/g, 's')
    .replace(/[yi]/g, 'i')
    .replace(/h/g, '');
}

function normalizeFuzzy(text: string): string {
  return phoneticCollapse(normalizeExact(text));
}

function levenshteinDistance(a: string, b: string): number {
  const n = a.length;
  const m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;

  let prev = new Array<number>(m + 1);
  let curr = new Array<number>(m + 1);
  for (let j = 0; j <= m; j++) prev[j] = j;

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

/** Umbral de tolerancia según longitud de palabra. Palabras cortas
 *  (3-4 letras, ej: "olla" -> "oia") necesitan mínimo 1 para tolerar
 *  plurales o variantes de escritura; floor(len/3) las deja en 0. */
function fuzzyThreshold(maxLen: number): number {
  if (maxLen <= 4) return 1;
  return Math.max(1, Math.floor(maxLen / 3));
}

function calculateScore(query: string, product: Product) {
  const qWords = normalizeExact(query)
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (qWords.length === 0) return { exactMatches: 0, fuzzyMatches: 0, total: 0, percentage: 0 };

  const pTextExact = normalizeExact(
    [product.name, product.brand, product.categoria?.name ?? ''].join(' ')
  );
  const pTextFuzzy = normalizeFuzzy(
    [product.name, product.brand, product.categoria?.name ?? ''].join(' ')
  );

  const pWordsExact = pTextExact.split(/\s+/).filter((w) => w.length > 0);
  const pWordsFuzzy = pTextFuzzy.split(/\s+/).filter((w) => w.length > 0);
  const qWordsFuzzy = qWords.map((w) => phoneticCollapse(w));

  let exactMatches = 0;
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

  if (exactMatches < qWords.length) {
    qWords.forEach((_, qIdx) => {
      const qWordFuzzy = qWordsFuzzy[qIdx];
      for (let i = 0; i < pWordsFuzzy.length; i++) {
        if (usedIndices.has(i)) continue;

        const maxLen = Math.max(qWordFuzzy.length, pWordsFuzzy[i].length);
        const threshold = fuzzyThreshold(maxLen);
        const dist = levenshteinDistance(qWordFuzzy, pWordsFuzzy[i]);

        if (dist <= threshold) {
          fuzzyMatches++;
          usedIndices.add(i);
          break;
        }
      }
    });
  }

  const total = exactMatches + fuzzyMatches;
  const percentage = (exactMatches / qWords.length) * 100;

  return { exactMatches, fuzzyMatches, total, percentage };
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { data: inventoryData, isLoading } = useInventory();
  const { data: upcomingProducts = [] } = useUpcomingProducts();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timeout);
    }, [])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as never, () => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    });
    return unsubscribe;
  }, [navigation]);

  const allProducts = useMemo<Product[]>(
    () => [
      ...(inventoryData?.products ?? []),
      ...upcomingProducts.map((p) => ({ ...p, isPreSale: true })),
    ],
    [inventoryData, upcomingProducts]
  );

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return allProducts;

    const scored = allProducts
      .map((product) => ({ product, ...calculateScore(trimmed, product) }))
      .filter((s) => s.total > 0);

    // Si hay productos con 100% de coincidencia exacta, mostrar SOLO esos
    const exact100 = scored.filter((s) => s.percentage === 100);
    if (exact100.length > 0) {
      return exact100.map((s) => s.product);
    }

    // Si hay coincidencias (fuzzy o parciales), mostrar los de mayor total
    if (scored.length > 0) {
      const maxTotal = Math.max(...scored.map((s) => s.total));
      return scored.filter((s) => s.total === maxTotal).map((s) => s.product);
    }

    // Fallback: coincidencia por caracteres
    const queryChars = [...new Set(normalizeFuzzy(trimmed).replace(/\s/g, '').split(''))];
    if (queryChars.length === 0) return [];

    const charScored = allProducts
      .map((product) => {
        const productText = normalizeFuzzy(
          [product.name, product.brand, product.categoria?.name ?? ''].join(' ')
        );
        const matches = queryChars.filter((character) => productText.includes(character)).length;
        return { product, matches };
      })
      .filter((item) => item.matches > 0);

    if (charScored.length === 0) return [];
    const maxCharMatches = Math.max(...charScored.map((item) => item.matches));
    return charScored.filter((item) => item.matches === maxCharMatches).map((item) => item.product);
  }, [query, allProducts]);

  return (
    <View className="flex-1 bg-white">
      <View className="bg-primary flex-row items-center gap-5 px-4 py-3">
        <View
          className={`h-12 flex-1 flex-row items-center rounded-2xl bg-white/80 px-4 ${
            isFocused ? 'border-primary border' : ''
          }`}>
          <Icon name="Search" size={22} color={colors.primary} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar productos..."
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            returnKeyType="search"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="text-text ml-2 flex-1 py-0 text-[15px]"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              accessibilityLabel="Limpiar búsqueda">
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
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.withInitialValues({ opacity: 1 })
                .duration(420)
                .delay(Math.min(index % 6, 5) * 55)
                .springify()
                .damping(18)}
              className="flex-1 px-1 py-2">
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
            </Animated.View>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-muted text-base">
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