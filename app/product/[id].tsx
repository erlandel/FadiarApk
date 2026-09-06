import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buildImageUrl } from '@/lib/api/config';
import { formatPrice } from '@/utils/format';
import { colors } from '@/lib/theme/colors';
import { Button } from '@/components/primitives/button';
import { Icon } from '@/icons/lucideIcon';
import { ProductCardSkeleton } from '@/components/product/productCardSkeleton';
import { useInventory } from '@/hooks/products/useInventory';
import { useUpcomingProducts } from '@/hooks/products/useUpcomingProducts';
import { useAddToCart } from '@/hooks/cart/useAddToCart';
import type { ProductID } from '@/types/product';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const { addToCart, loading: addingToCart } = useAddToCart();

  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const { data: upcoming, isLoading: upcomingLoading } = useUpcomingProducts();

  const product = useMemo<ProductID | null>(() => {
    const source = [...(inventory?.products ?? []), ...(upcoming ?? [])] as ProductID[];
    return source.find((p) => String(p.id) === String(id)) ?? null;
  }, [inventory, upcoming, id]);

  const isLoading = inventoryLoading || upcomingLoading;

  const warrantyMonths = product ? Number(product.warranty ?? 0) / 30 : 0;
  const isPreSale = !!product?.count === false;
  const hasDiscount = !!product?.temporal_price && Number(product.temporal_price) > 0;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Icon name="ArrowLeft" size={24} color={colors.primary} />
        </Pressable>
        <Text className="text-lg font-bold text-primary">Detalles del Producto</Text>
      </View>

      {isLoading ? (
        <ScrollView className="flex-1">
          <View className="px-4 py-4">
            <ProductCardSkeleton />
          </View>
        </ScrollView>
      ) : !product ? (
        <View className="flex-1 items-center justify-center">
          <Text className="mb-4 text-xl font-bold text-primary">Producto no encontrado</Text>
          <Button title="Volver" variant="outline" onPress={() => router.back()} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mx-4 mt-2 h-80 items-center justify-center rounded-2xl bg-surface">
            <Image
              source={{ uri: buildImageUrl(product.img) }}
              className="h-full w-full"
              resizeMode="contain"
            />
            {!isPreSale && product.count === 0 ? (
              <View className="absolute top-3 right-3 rounded-full bg-error px-3 py-1">
                <Text className="text-xs font-bold text-white">Agotado</Text>
              </View>
            ) : null}
          </View>

          <View className="px-4 py-5">
            <Text className="text-sm text-muted">{product.categoria?.name || 'Sin categoría'}</Text>
            <Text className="mt-1 text-3xl font-bold text-textHeading">{product.name}</Text>
            <Text className="text-xl font-medium text-primary">{product.brand}</Text>

            {product.description ? (
              <Text className="mt-3 text-justify text-base text-text">{product.description}</Text>
            ) : null}

            {warrantyMonths > 0 ? (
              <Text className="mt-2 font-semibold text-yellow-500">
                Garantía de {warrantyMonths} meses
              </Text>
            ) : null}

            <View className="mt-3 flex-row items-center gap-3">
              {hasDiscount ? (
                <>
                  <Text className="text-3xl font-bold text-primary">
                    {formatPrice(product.temporal_price!, product.currency?.currency)}
                  </Text>
                  <Text className="text-lg text-muted line-through">
                    {formatPrice(product.price, product.currency?.currency)}
                  </Text>
                </>
              ) : (
                <Text className="text-3xl font-bold text-primary">
                  {formatPrice(product.price, product.currency?.currency)}
                </Text>
              )}
            </View>

            {!isPreSale && (
              <View className="mt-6 flex-row items-center gap-4">
                <View className="flex-row items-center rounded-xl border border-primary">
                  <Pressable
                    onPress={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-4 py-3"
                  >
                    <Icon name="Minus" size={20} color={colors.accent} />
                  </Pressable>
                  <Text className="px-4 text-lg font-bold text-textHeading">{qty}</Text>
                  <Pressable
                    onPress={() => {
                      if (product.count !== undefined && qty + 1 > product.count) {
                        return;
                      }
                      setQty((q) => q + 1);
                    }}
                    className="px-4 py-3"
                  >
                    <Icon name="Plus" size={20} color={colors.accent} />
                  </Pressable>
                </View>

                <Button
                  title={product.count === 0 ? 'Agotado' : addingToCart ? 'Añadiendo...' : 'Añadir al carrito'}
                  className="flex-1"
                  disabled={product.count === 0 || addingToCart}
                  onPress={() =>
                    addToCart({ productId: product.id, tiendaId: product.tiendaId, quantity: qty })
                  }
                />
              </View>
            )}

            {product.specs && product.specs.length > 0 ? (
              <View className="mt-8 rounded-xl border border-gray-100 bg-surface p-4">
                <Text className="mb-3 font-semibold text-textHeading">Propiedades</Text>
                {product.specs.map((spec, i) => (
                  <View key={i} className="flex-row justify-between border-b border-gray-100 py-2">
                    <Text className="max-w-[50%] text-sm text-text">{spec.name}</Text>
                    <Text className="max-w-[50%] text-right text-sm text-text">{spec.description}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}